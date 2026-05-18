const supabase = require('../config/supabase');
const { rejectWithoutSupabase, isSupabaseConfigured } = require('../utils/saas');

exports.getNotifications = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, data: [] });
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('school_id', req.user.schoolId);

    // Filter by role: parents see their child's private alerts + school announcements.
    // Admins, teachers, and staff should only see school-wide announcements in their tray to avoid privacy leaks and noise.
    if (req.user.role === 'parent') {
      if (req.user.studentId) {
        query = query.or(`student_id.eq.${req.user.studentId},student_id.is.null`);
      } else {
        query = query.is('student_id', null);
      }
    } else {
      query = query.is('student_id', null);
    }

    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const mapped = notifications.map((n) => ({
      ...n,
      _id: n.id,
      createdAt: n.created_at,
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, message: 'Supabase is not configured.' });
    }

    const { title, message, type, recipient } = req.body;

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([
        {
          school_id: req.user.schoolId,
          title,
          message,
          type: type || 'Announcement',
          student_id: recipient === 'All' ? null : recipient,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: { ...notification, _id: notification.id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, message: 'Supabase is not configured.' });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('school_id', req.user.schoolId);

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.sendAlert = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, message: 'Supabase is not configured.' });
    }

    const { studentId, type, message, contact } = req.body;

    console.log(`\n--- OUTGOING NOTIFICATION ---`);
    console.log(`TO: ${contact}`);
    console.log(`TYPE: ${type.toUpperCase()}`);
    console.log(`MESSAGE: ${message}`);
    console.log(`-----------------------------\n`);

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([
        {
          school_id: req.user.schoolId,
          title: `${type === 'attendance' ? 'Low Attendance' : 'Fee Reminder'} Alert`,
          message,
          type: type === 'attendance' ? 'Attendance' : 'Fee',
          student_id: studentId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Alert sent to ${contact} via SMS/WhatsApp`,
      data: { ...notification, _id: notification.id },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
