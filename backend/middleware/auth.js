const admin = require('../config/firebase');
const { getJwtSecret } = require('../config/jwt');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    let decodedToken;
    let isParentToken = false;

    const jwt = require('jsonwebtoken');
    try {
      // Verify our custom SaaS token (Admin, Teacher, Parent)
      decodedToken = jwt.verify(token, getJwtSecret());
      isParentToken = decodedToken.role === 'parent';
    } catch (e) {
      // Fallback for old Firebase tokens (if any lingering sessions exist)
      if (admin.isMock) {
        const payload = jwt.decode(token);
        if (!payload) throw new Error('Invalid token format');
        decodedToken = {
          email: payload.email || (token.includes('@') ? token : 'admin@school.com'),
          name: payload.name || 'Test Admin',
          uid: payload.user_id || payload.sub || 'mock_uid',
          role: 'admin', // Assume admin for legacy mocks
        };
      } else {
        decodedToken = await admin.auth().verifyIdToken(token);
      }
    }

    const email =
      decodedToken.email ||
      (typeof decodedToken.id === 'string' && decodedToken.id.includes('@')
        ? decodedToken.id
        : null);

    if (!email) {
      return res.status(401).json({ success: false, message: 'Invalid token: email missing' });
    }

    if (isParentToken) {
      req.user = {
        id: decodedToken.id,
        email: String(decodedToken.email).toLowerCase(),
        name: decodedToken.name,
        role: decodedToken.role,
        schoolId: decodedToken.schoolId,
        studentId: decodedToken.studentId,
      };
      return next();
    }

    // SaaS Integration: Fetch user profile and school_id from Supabase
    const supabase = require('../config/supabase');
    const { data: sbUser, error: sbError } = await supabase
      .from('users')
      .select('id, school_id, role, name, schools(*)')
      .eq('email', email.toLowerCase())
      .single();

    if (sbError || !sbUser) {
      console.error(
        `[Auth] BLOCKED: User ${email} not found in Supabase users table. They must use their registered email.`
      );
      return res.status(401).json({
        success: false,
        message: `Account not found for ${email}. Please use the email address you originally registered with, or contact the administrator.`,
      });
    }

    req.user = {
      id: sbUser.id || decodedToken.id || decodedToken.uid,
      email: email.toLowerCase(),
      name: sbUser.name,
      role: sbUser.role,
      schoolId: sbUser.school_id,
      schoolLogo: sbUser.schools?.logo || null,
    };

    if (!req.user.schoolId && req.user.role !== 'superadmin') {
      console.error(`[Auth] CRITICAL: User ${email} has no school_id assigned.`);
      return res.status(403).json({
        success: false,
        message: 'Account configuration error. No school assigned.',
      });
    }

    next();
  } catch (err) {
    console.error('[Auth Error]:', err.message || err);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    let allowedRoles = [...roles];
    if (allowedRoles.includes('admin')) {
      allowedRoles = [...allowedRoles, 'principal', 'manager', 'director'];
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
