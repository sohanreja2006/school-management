const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getJwtSecret, getJwtExpiresIn } = require('../config/jwt');
const { rejectWithoutSupabase } = require('../utils/saas');
const { sendOTP } = require('../utils/email');
const Otp = require('../models/Otp');
const inMemoryOtps = new Map(); // Bulletproof in-memory fallback for MongoDB timeouts

const MIN_PASSWORD_LENGTH = 8;

async function verifyPassword(plain, stored) {
  if (!stored || typeof stored !== 'string') return false;
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

async function maybeRehashPassword(userId, plain, stored) {
  if (
    !stored ||
    stored.startsWith('$2a$') ||
    stored.startsWith('$2b$') ||
    stored.startsWith('$2y$')
  ) {
    return;
  }
  const hash = await bcrypt.hash(plain, 12);
  await supabase.from('users').update({ password: hash }).eq('id', userId);
}

// MongoDB will be used for OTP storage

// @desc    Request Registration OTP
exports.requestOTP = async (req, res) => {
  try {
    const { email, schoolName } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailNorm = email.toLowerCase().trim();

    // Check if email is already registered
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailNorm)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered. Please sign in instead.' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP using bcrypt
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save in-memory fallback always (failsafe, instantaneous, never blocks)
    inMemoryOtps.set(emailNorm, {
      otp: hashedOtp,
      expiresAt: Date.now() + 300000 // 5 minutes
    });

    // Try MongoDB storage ONLY if connection is active—otherwise skip gracefully to avoid hangs!
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        await Promise.race([
          Otp.deleteMany({ email: emailNorm }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB timeout')), 2000))
        ]);
        await Promise.race([
          Otp.create({ email: emailNorm, otp: hashedOtp }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB timeout')), 2000))
        ]);
      } catch (dbErr) {
        console.warn('[MongoDB WARNING] Failed to persist OTP to DB, falling back to Memory store:', dbErr.message);
      }
    } else {
      console.log('MongoDB not fully connected yet. Storing OTP in-memory.');
    }

    try {
      const emailResult = await sendOTP(emailNorm, otp, schoolName || 'Your Institution');
      if (emailResult && (emailResult.mode === 'virtual_fallback' || emailResult.mode === 'virtual')) {
        return res.status(200).json({ 
          success: true, 
          message: emailResult.mode === 'virtual' ? 'OTP saved to Virtual Inbox (No email credentials)' : 'OTP saved to Virtual Inbox (Google SMTP failed)', 
          devOtp: otp 
        });
      }
      res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (emailErr) {
      console.warn('Failed to send OTP email:', emailErr.message);
      throw emailErr;
    }
  } catch (err) {
    console.error('OTP Request Full Error:', err);
    const errorMessage = err.message || 'Internal server error';
    res.status(500).json({ 
      success: false, 
      message: `Email Error: ${errorMessage}. Check your SMTP credentials or check the terminal output for the virtual inbox.`
    });
  }
};

// @desc    Register user (new tenant school + admin)
exports.register = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;

    const { name, email, password, role, schoolName, otp } = req.body;
    const emailNorm = (email || '').toLowerCase().trim();

    if (!name || !emailNorm || !password || !otp) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and OTP are required' });
    }

    // Verify OTP (Try Mongo first if connected, then fall back to Memory)
    let otpRecord = null;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        otpRecord = await Promise.race([
          Otp.findOne({ email: emailNorm }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB timeout')), 2000))
        ]);
      } catch (dbErr) {
        console.warn('[MongoDB WARNING] Failed to fetch OTP from DB, attempting memory fallback:', dbErr.message);
      }
    }

    if (!otpRecord) {
      const memRecord = inMemoryOtps.get(emailNorm);
      if (memRecord && memRecord.expiresAt > Date.now()) {
        otpRecord = memRecord;
      }
    }
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const isValidOtp = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // OTP is valid, proceed with registration
    inMemoryOtps.delete(emailNorm);
    if (mongoose.connection.readyState === 1) {
      try {
        await Promise.race([
          Otp.deleteMany({ email: emailNorm }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB timeout')), 2000))
        ]);
      } catch (e) {}
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert([{ name: schoolName || `${name}'s School` }])
      .select()
      .single();

    if (schoolError) throw schoolError;

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: emailNorm,
          password: passwordHash,
          role: role || 'admin',
          school_id: school.id,
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const emailNorm = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('*, schools(*)')
      .eq('email', emailNorm)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.school_name = user.schools?.name;
    user.school_logo = user.schools?.logo;

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await maybeRehashPassword(user.id, password, user.password);

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    {
      id: user.id,
      uid: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.school_id,
    },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.school_id,
      schoolName: user.school_name || 'Academix School',
      schoolLogo: user.school_logo || null,
    },
  });
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { ...req.user, _id: req.user.id },
  });
};

// @desc    OAuth Sync (Login/Register via Google/OAuth)
exports.oauthSync = async (req, res) => {
  try {
    const { email, name, provider_id } = req.body;
    const emailNorm = (email || '').toLowerCase().trim();

    if (!emailNorm) {
      return res.status(400).json({ success: false, message: 'Email is required for OAuth' });
    }

    // Check if user exists
    let { data: user, error } = await supabase
      .from('users')
      .select('*, schools(*)')
      .eq('email', emailNorm)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (!user) {
      // Create user without school_id (will be completed later)
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            name: name || 'Google User',
            email: emailNorm,
            role: 'admin',
            school_id: null, // Critical: this triggers the "Complete Profile" flow on frontend
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    if (user.schools) {
      user.school_name = user.schools.name;
      user.school_logo = user.schools.logo;
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('OAuth Sync Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Complete Profile (Add school and update name/role)
exports.completeProfile = async (req, res) => {
  try {
    const { name, schoolName, role, phone, address, studentCount } = req.body;
    const userId = req.user.id;

    if (!schoolName) {
      return res.status(400).json({ success: false, message: 'School name is required' });
    }

    // 1. Create the school with more details
    let { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert([{ 
        name: schoolName,
        phone: phone || null,
        address: address || null,
        student_count: studentCount || null
      }])
      .select()
      .single();

    if (schoolError) {
      // If error because columns don't exist, fallback to just name
      console.warn('Could not insert extra school fields, falling back to name only:', schoolError.message);
      const { data: fallbackSchool, error: fallbackError } = await supabase
        .from('schools')
        .insert([{ name: schoolName }])
        .select()
        .single();
      
      if (fallbackError) throw fallbackError;
      school = fallbackSchool;
    }

    // 2. Update the user
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update({
        name: name || req.user.name,
        role: role || 'admin',
        school_id: school.id
      })
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;

    updatedUser.school_name = school.name;

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        schoolId: updatedUser.school_id,
        schoolName: updatedUser.school_name
      }
    });
  } catch (err) {
    console.error('Complete Profile Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update Profile (Admin/School info)
exports.updateProfile = async (req, res) => {
  try {
    const { name, role, schoolName, logo } = req.body;
    const userId = req.user.id;
    const schoolId = req.user.schoolId;

    // 1. Update user info
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update({
        name: name || req.user.name,
        role: role || req.user.role
      })
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;

    // 2. Update school info
    let updatedSchoolName = req.user.schoolName;
    let updatedSchoolLogo = req.user.schoolLogo;
    if (schoolId && (schoolName || logo !== undefined)) {
      const updateData = {};
      if (schoolName) updateData.name = schoolName;
      if (logo !== undefined) updateData.logo = logo;

      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .update(updateData)
        .eq('id', schoolId)
        .select()
        .single();
      
      if (schoolError) {
        console.error('School Update Error:', schoolError);
        if (schoolError.code === '42703' || schoolError.message.includes('column')) {
            throw new Error('Database Error: Missing "logo" column. Please run this in Supabase SQL editor: ALTER TABLE schools ADD COLUMN logo TEXT;');
        }
        throw new Error('Failed to update school details: ' + schoolError.message);
      }

      if (school) {
        updatedSchoolName = school.name;
        updatedSchoolLogo = school.logo;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        schoolId: updatedUser.school_id,
        schoolName: updatedSchoolName,
        schoolLogo: updatedSchoolLogo
      }
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
