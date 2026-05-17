const supabase = require('../config/supabase');

exports.getTimetable = async (req, res) => {
  try {
    const { className, teacher } = req.query;
    let query = supabase.from('timetables').select('*').eq('school_id', req.user.schoolId).order('day').order('start_time');
    
    if (className) query = query.eq('class', className);
    if (teacher) query = query.eq('teacher', teacher);

    const { data: schedule, error } = await query;
    if (error) throw error;
    
    res.status(200).json({ success: true, data: schedule.map(t => ({ ...t, _id: t.id, startTime: t.start_time, endTime: t.end_time })) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const { class: className, subject, teacher, day, startTime, endTime, room } = req.body;
    const { data: entry, error } = await supabase
      .from('timetables')
      .insert([{
        school_id: req.user.schoolId,
        class: className,
        subject,
        teacher,
        day,
        start_time: startTime,
        end_time: endTime,
        room
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: { ...entry, _id: entry.id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { class: className, subject, teacher, day, startTime, endTime, room } = req.body;
    const { data: entry, error } = await supabase
      .from('timetables')
      .update({
        class: className,
        subject,
        teacher,
        day,
        start_time: startTime,
        end_time: endTime,
        room
      })
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data: { ...entry, _id: entry.id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const { error } = await supabase
      .from('timetables')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId);

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
