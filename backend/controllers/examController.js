const supabase = require('../config/supabase');

exports.getExams = async (req, res) => {
  try {
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
      .eq('school_id', req.user.schoolId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('[GET EXAMS] Supabase Error:', error);
      throw error;
    }
    
    res.status(200).json({ success: true, data: exams.map(e => ({ ...e, _id: e.id, startDate: e.start_date, endDate: e.end_date })) });
  } catch (err) {
    console.error('[GET EXAMS] Catch Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { name, type, startDate, endDate, classes, status } = req.body;
    
    const insertData = {
      school_id: req.user.schoolId,
      name,
      type,
      start_date: startDate,
      end_date: endDate,
      status
    };
    
    // Only add classes if it's provided and not empty
    if (classes) insertData.classes = classes;

    const { data: exam, error } = await supabase
      .from('exams')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('[CREATE EXAM] Supabase Error:', error);
      throw error;
    }
    res.status(201).json({ success: true, data: { ...exam, _id: exam.id } });
  } catch (err) {
    console.error('[CREATE EXAM] Catch Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { name, type, startDate, endDate, classes, status } = req.body;
    
    const updateData = {
      name,
      type,
      start_date: startDate,
      end_date: endDate,
      status
    };
    
    if (classes) updateData.classes = classes;

    const { data: exam, error } = await supabase
      .from('exams')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId)
      .select()
      .single();

    if (error) {
      console.error('[UPDATE EXAM] Supabase Error:', error);
      throw error;
    }
    res.status(200).json({ success: true, data: { ...exam, _id: exam.id } });
  } catch (err) {
    console.error('[UPDATE EXAM] Catch Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId);

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
