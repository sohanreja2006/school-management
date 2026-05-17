const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { getJwtSecret, getJwtExpiresIn } = require('../config/jwt');
const { isProduction, rejectWithoutSupabase } = require('../utils/saas');

// @desc    Parent Login with Email and Generated Key
// @route   POST /api/auth/parent/login
exports.login = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;

    const { email, parentKey } = req.body;
    const emailStr = (email || '').toLowerCase().trim();
    const keyStr = (parentKey || '').toString().trim();

    if (!emailStr || !keyStr) {
      return res.status(400).json({ success: false, message: 'Please provide email and parent key' });
    }

    // Debug bypass only outside production
    if (!isProduction() && emailStr === 'debug@test.com' && keyStr === '123456') {
      const { data: allStudents } = await supabase.from('students').select('*').limit(1);
      const student = allStudents?.[0] || {
        id: 'mock_std_123',
        name: 'Demo Student',
        class: '10th-A',
        parent_name: 'Demo Parent',
        school_id: 'school_1',
      };

      const payload = buildPayload(emailStr, student);
      const token = jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
      return res.status(200).json({ success: true, token, user: payload });
    }

    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .ilike('parent_email', emailStr)
      .eq('parent_key', keyStr)
      .limit(1);

    if (error) {
      console.error('[ParentLogin DB Error]', error);
      const { data: altStudents } = await supabase
        .from('students')
        .select('*')
        .ilike('email', emailStr)
        .eq('parent_key', keyStr)
        .limit(1);

      if (altStudents && altStudents.length > 0) {
        const payload = buildPayload(emailStr, altStudents[0]);
        const token = jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
        return res.status(200).json({ success: true, token, user: payload });
      }

      return res.status(500).json({ success: false, message: 'Database Error', error: error.message });
    }

    if (!students || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or parent key' });
    }

    const student = students[0];
    const payload = buildPayload(emailStr, student);
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });

    return res.status(200).json({ success: true, token, user: payload });
  } catch (err) {
    console.error('[ParentLogin crash]', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.requestOtp = (req, res) =>
  res.status(400).json({ success: false, message: 'OTP is disabled. Use key login.' });
exports.verifyOtp = exports.login;

function buildPayload(email, student) {
  return {
    id: `parent_${student.id}`,
    uid: `parent_${student.id}`,
    email,
    name: student.parent_name || 'Parent',
    role: 'parent',
    studentId: student.id,
    schoolId: student.school_id,
    childName: student.name,
  };
}
