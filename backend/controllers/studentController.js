const supabase = require('../config/supabase');
const { rejectWithoutSupabase, isSupabaseConfigured } = require('../utils/saas');

// Helper to map Supabase snake_case to Frontend CamelCase
const mapStudent = (s) => ({
  id: s.id,
  _id: s.id,
  name: s.name,
  class: s.class,
  rollNumber: s.roll_number,
  contact: s.contact,
  parentName: s.parent_name,
  parentEmail: s.parent_email,
  parentKey: s.parent_key,
  address: s.address,
  totalFees: s.total_fees,
  paidFees: s.paid_fees,
  photo: s.photo,
  createdAt: s.created_at
});

const crypto = require('crypto');

function generateParentKey() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // Generates an 8-character key
}

const PG_UNIQUE_VIOLATION = '23505';

function isRollNumberConflict(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return (
    err.code === PG_UNIQUE_VIOLATION &&
    (msg.includes('roll_number') ||
      msg.includes('students_school_id_roll_number') ||
      msg.includes('students_school_class_roll_number') ||
      msg.includes('school_id, class, roll_number'))
  );
}

/** Same roll may exist in different classes; only (school, class, roll) must be unique. */
async function findRollDuplicate(supabase, schoolId, className, rollNumber, excludeStudentId) {
  const roll = rollNumber != null && String(rollNumber).trim() !== '' ? String(rollNumber).trim() : null;
  if (!roll) return null;

  const cls = className != null ? String(className).trim() : '';

  let q = supabase
    .from('students')
    .select('id, name')
    .eq('school_id', schoolId)
    .eq('class', cls)
    .eq('roll_number', roll)
    .limit(1);

  if (excludeStudentId) {
    q = q.neq('id', excludeStudentId);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data && data.length ? data[0] : null;
}

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Returning mock student list.');
      const mockStudents = [
        { id: '1', name: 'Rahul Sharma', class: '10th', rollNumber: '101', email: 'rahul@example.com' },
        { id: '2', name: 'Priya Singh', class: '10th', rollNumber: '102', email: 'priya@example.com' }
      ];
      return res.status(200).json({
        success: true,
        count: mockStudents.length,
        data: mockStudents,
      });
    }

    let { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', req.user.schoolId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: students.length,
      data: students.map(mapStudent),
    });
  } catch (err) {
    console.error('Error in getStudents:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, message: 'Supabase is not configured.' });
    }

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId)
      .single();

    if (error || !student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: mapStudent(student) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add student
// @route   POST /api/students
// @access  Private (Admin/Teacher)
exports.addStudent = async (req, res) => {
  try {
    const { name, class: className, rollNumber, contact, parentName, parentEmail, address, totalFees, paidFees } = req.body;

    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Simulating student addition.');
      return res.status(201).json({ 
        success: true, 
        data: { ...req.body, id: 'mock_std_' + Date.now() },
        message: 'Student added successfully (Mock Mode)'
      });
    }

    const parentKey = parentName ? generateParentKey() : null;

    const { photo } = req.body;

    const dup = await findRollDuplicate(
      supabase,
      req.user.schoolId,
      className,
      rollNumber,
      null
    );
    if (dup) {
      return res.status(409).json({
        success: false,
        message: `Roll number "${rollNumber}" is already used in class "${className}" by ${dup.name}.`,
      });
    }

    const { data: student, error } = await supabase
      .from('students')
      .insert([{
        school_id: req.user.schoolId,
        name,
        class: className,
        roll_number: rollNumber,
        contact,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_key: parentKey,
        address,
        total_fees: Number(totalFees) || 0,
        paid_fees: Number(paidFees) || 0,
        photo: photo || null
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '42703') {
        throw new Error(
          'Database Error: Please add a "parent_key" (text) column to your students table in Supabase.'
        );
      }
      if (isRollNumberConflict(error)) {
        return res.status(409).json({
          success: false,
          message:
            'This roll number is already used in that class. Pick another roll, or run backend/sql/supabase_students_roll_number_unique.sql if your database still enforces a global roll rule.',
        });
      }
      throw error;
    }

    res.status(201).json({ success: true, data: mapStudent(student) });
  } catch (err) {
    console.error('Error in addStudent:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin/Teacher)
exports.updateStudent = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, message: 'Supabase is not configured.' });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.class) updateData.class = req.body.class;
    if (req.body.rollNumber) updateData.roll_number = req.body.rollNumber;
    if (req.body.contact) updateData.contact = req.body.contact;
    if (req.body.parentName) updateData.parent_name = req.body.parentName;
    
    // Only generate a new key if explicitly requested OR if it's a new student (handled in addStudent)
    if (req.body.regenerateKey) {
      updateData.parent_key = generateParentKey();
    }

    if (req.body.parentEmail !== undefined) {
      updateData.parent_email = req.body.parentEmail;
    }
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.totalFees) updateData.total_fees = Number(req.body.totalFees);
    if (req.body.paidFees) updateData.paid_fees = Number(req.body.paidFees);
    if (req.body.photo !== undefined) updateData.photo = req.body.photo;

    const { data: existingRow, error: existingErr } = await supabase
      .from('students')
      .select('class, roll_number')
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId)
      .maybeSingle();

    if (existingErr) throw existingErr;
    if (!existingRow) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const nextClass =
      updateData.class !== undefined ? updateData.class : existingRow.class;
    const nextRoll =
      updateData.roll_number !== undefined ? updateData.roll_number : existingRow.roll_number;

    if (nextRoll != null && String(nextRoll).trim() !== '') {
      const dup = await findRollDuplicate(
        supabase,
        req.user.schoolId,
        nextClass,
        String(nextRoll).trim(),
        req.params.id
      );
      if (dup) {
        return res.status(409).json({
          success: false,
          message: `Roll number "${nextRoll}" is already used in class "${nextClass}" by ${dup.name}.`,
        });
      }
    }

    const { data: student, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId)
      .select()
      .single();

    if (error) {
      if (isRollNumberConflict(error)) {
        return res.status(409).json({
          success: false,
          message:
            'This roll number is already used in that class. Choose a different roll or move the student to another class.',
        });
      }
      console.error('Update Student Error:', error);
      return res.status(400).json({ success: false, message: error.message || 'Update failed', error });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: mapStudent(student) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, message: 'Supabase is not configured.' });
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId);

    if (error) throw error;

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
