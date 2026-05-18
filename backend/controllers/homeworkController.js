const supabase = require('../config/supabase');
const { rejectWithoutSupabase, isSupabaseConfigured } = require('../utils/saas');

// @desc    Get all homework
// @route   GET /api/homework
// @access  Private
exports.getHomework = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: homework, error } = await supabase
      .from('homework')
      .select('*')
      .eq('school_id', req.user.schoolId)
      .order('due_date', { ascending: false });

    if (error) throw error;

    // Map fields to match what the frontend and table expects
    const mapped = homework.map(h => ({
      ...h,
      _id: h.id,
      dueDate: h.due_date,
      teacher: { name: 'Teacher' }
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new homework
// @route   POST /api/homework
// @access  Private
exports.createHomework = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, message: 'Mock Mode' });
    }

    const { title, subject, class: className, dueDate, description } = req.body;

    const { data: homework, error } = await supabase
      .from('homework')
      .insert([{
        school_id: req.user.schoolId,
        title,
        subject,
        class: className,
        due_date: dueDate,
        description,
        teacher_id: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: { ...homework, _id: homework.id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
