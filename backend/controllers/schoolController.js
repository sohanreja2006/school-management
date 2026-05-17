const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { getJwtSecret, getJwtExpiresIn } = require('../config/jwt');

// @desc    Update school payment details (UPI/QR)
// @route   PUT /api/school/payment-settings
// @access  Private (Admin)
exports.updatePaymentSettings = async (req, res) => {
  try {
    const { upiId, qrCodeUrl } = req.body;
    const schoolId = req.user.schoolId;

    if (!upiId) return res.status(400).json({ success: false, error: 'UPI ID is required' });

    // Try updating the school record
    // We use a flexible approach in case columns upi_id or qr_code_url are missing
    const updatePayload = { upi_id: upiId, qr_code_url: qrCodeUrl };
    
    const { data, error } = await supabase
      .from('schools')
      .update(updatePayload)
      .eq('id', schoolId)
      .select()
      .single();

    if (error) {
      console.error('[updatePaymentSettings] Error:', error.message);
      // If the error is 'column does not exist', we tell the user exactly what to do
      if (error.message.includes('column') || error.code === '42703') {
        return res.status(400).json({ 
          success: false, 
          error: 'SQL ERROR: Missing columns. Please run: ALTER TABLE schools ADD COLUMN upi_id TEXT, ADD COLUMN qr_code_url TEXT;' 
        });
      }
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[updatePaymentSettings] Catch:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get school payment details
// @route   GET /api/school/payment-settings
// @access  Private
exports.getPaymentSettings = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const { data, error } = await supabase
      .from('schools')
      .select('upi_id, qr_code_url, name')
      .eq('id', schoolId)
      .single();

    if (error) {
      return res.status(200).json({ 
        success: true, 
        data: { upi_id: 'pending@upi', qr_code_url: '', name: 'School' } 
      });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add staff/teacher
// @route   POST /api/school/staff
// @access  Private (Admin)
exports.addStaff = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { name, contact, assignedClasses, role } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    // Auto-generate staff_id e.g. TCH-8291
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const staffId = `TCH-${randomDigits}`;
    const staffKey = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit PIN

    // Convert assignedClasses array to comma-separated string if needed
    let classesStr = '';
    if (Array.isArray(assignedClasses)) {
      classesStr = assignedClasses.join(',');
    } else if (typeof assignedClasses === 'string') {
      classesStr = assignedClasses;
    }

    const { data, error } = await supabase
      .from('staff')
      .insert({
        school_id: schoolId,
        staff_id: staffId,
        name,
        role: role || 'Teacher',
        contact: contact || '',
        assigned_classes: classesStr,
        staff_key: staffKey,
        status: 'Active'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        throw new Error('Database Error: Missing "staff" table. Please run this in Supabase SQL editor: CREATE TABLE staff (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, school_id UUID, staff_id TEXT, name TEXT, role TEXT DEFAULT \'Teacher\', contact TEXT, assigned_classes TEXT, staff_key TEXT, status TEXT DEFAULT \'Active\', created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()));');
      }
      throw error;
    }

    const formattedData = {
      id: data.id,
      staffId: data.staff_id,
      name: data.name,
      role: data.role,
      contact: data.contact,
      assignedClasses: data.assigned_classes ? data.assigned_classes.split(',').filter(Boolean) : [],
      staffKey: data.staff_key,
      status: data.status,
      createdAt: data.created_at
    };

    res.status(201).json({ success: true, data: formattedData });
  } catch (err) {
    console.error('Add Staff Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all staff/teachers
// @route   GET /api/school/staff
// @access  Private
exports.getStaff = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      if (error.code === '42P01' || error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
        return res.status(200).json({ success: true, data: [] });
      }
      throw error;
    }

    const formattedData = data.map(s => ({
      id: s.id,
      staffId: s.staff_id,
      name: s.name,
      role: s.role,
      contact: s.contact,
      assignedClasses: s.assigned_classes ? s.assigned_classes.split(',').filter(Boolean) : [],
      staffKey: s.staff_key,
      status: s.status,
      createdAt: s.created_at
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (err) {
    console.error('Get Staff Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update staff/teacher
// @route   PUT /api/school/staff/:id
// @access  Private (Admin)
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, assignedClasses, role, status } = req.body;

    let updatePayload = {};
    if (name) updatePayload.name = name;
    if (contact !== undefined) updatePayload.contact = contact;
    if (role) updatePayload.role = role;
    if (status) updatePayload.status = status;

    if (assignedClasses !== undefined) {
      if (Array.isArray(assignedClasses)) {
        updatePayload.assigned_classes = assignedClasses.join(',');
      } else {
        updatePayload.assigned_classes = assignedClasses;
      }
    }

    if (req.body.resetKey) {
      updatePayload.staff_key = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const { data, error } = await supabase
      .from('staff')
      .update(updatePayload)
      .eq('id', id)
      .eq('school_id', req.user.schoolId)
      .select()
      .single();

    if (error) throw error;

    const formattedData = {
      id: data.id,
      staffId: data.staff_id,
      name: data.name,
      role: data.role,
      contact: data.contact,
      assignedClasses: data.assigned_classes ? data.assigned_classes.split(',').filter(Boolean) : [],
      staffKey: data.staff_key,
      status: data.status,
      createdAt: data.created_at
    };

    res.status(200).json({ success: true, data: formattedData });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete staff/teacher
// @route   DELETE /api/school/staff/:id
// @access  Private (Admin)
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)
      .eq('school_id', req.user.schoolId);

    if (error) throw error;
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Staff Login (Mobile App)
// @route   POST /api/school/staff-login
// @access  Public
exports.staffLogin = async (req, res) => {
  try {
    const { staff_id, staff_key } = req.body;

    if (!staff_id || !staff_key) {
      return res.status(400).json({ success: false, message: 'Staff ID and 4-Digit Key are required' });
    }

    const cleanStaffId = staff_id.trim();
    const cleanKey = staff_key.trim();

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*, schools(name, logo)')
      .ilike('staff_id', cleanStaffId)
      .eq('staff_key', cleanKey)
      .eq('status', 'Active')
      .maybeSingle();

    if (error || !staff) {
      return res.status(401).json({ success: false, message: 'Invalid Staff ID or 4-Digit Key' });
    }

    const token = jwt.sign(
      {
        id: staff.id,
        uid: staff.id,
        email: `${staff.staff_id.toLowerCase()}@academix.school`,
        role: staff.role ? staff.role.toLowerCase() : 'teacher',
        schoolId: staff.school_id,
      },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: staff.id,
        _id: staff.id,
        staffId: staff.staff_id,
        name: staff.name,
        role: staff.role ? staff.role.toLowerCase() : 'teacher',
        contact: staff.contact,
        assignedClasses: staff.assigned_classes ? staff.assigned_classes.split(',').filter(Boolean) : [],
        schoolId: staff.school_id,
        schoolName: staff.schools?.name || 'Academix School',
        schoolLogo: staff.schools?.logo || null,
      }
    });
  } catch (err) {
    console.error('Staff Login Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
