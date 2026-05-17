const supabase = require('../config/supabase');

exports.getSubjects = async (req, res) => {
  try {
    const { className } = req.query;
    let query = supabase.from('subjects').select('*').eq('school_id', req.user.schoolId).order('name');
    
    if (className) query = query.eq('class', className);
    
    const { data: subjects, error } = await query;
    if (error) throw error;
    
    res.status(200).json({ success: true, data: subjects.map(s => ({ ...s, _id: s.id })) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, class: className, maxMarks, passMarks } = req.body;
    const { data: subject, error } = await supabase
      .from('subjects')
      .insert([{ 
        school_id: req.user.schoolId,
        name, 
        class: className, 
        max_marks: maxMarks, 
        pass_marks: passMarks 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: { ...subject, _id: subject.id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId);

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
