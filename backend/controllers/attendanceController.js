const supabase = require('../config/supabase');
const { rejectWithoutSupabase, isSupabaseConfigured } = require('../utils/saas');

/** Compare calendar month using YYYY-MM-DD (avoids UTC/local midnight bugs). */
function isDateInCalendarMonth(dateStr, refDate = new Date()) {
  const part = String(dateStr || '').split('T')[0];
  const m = part.match(/^(\d{4})-(\d{2})/);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  return y === refDate.getFullYear() && mo === refDate.getMonth();
}

function isPresentOrLate(status) {
  const s = (status || '').toString().toLowerCase().trim();
  return s === 'present' || s === 'late';
}

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    const schoolId = req.user.schoolId;

    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, message: 'Mock Mode' });
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];

    // 1. SAFE SAVE: Delete existing record for this day first to avoid constraint errors
    const { error: deleteError } = await supabase
      .from('attendance')
      .delete()
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .eq('date', formattedDate);

    if (deleteError) throw deleteError;

    // 2. Insert new record
    const { data: attendance, error: insertError } = await supabase
      .from('attendance')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        date: formattedDate,
        status,
        marked_by: req.user.id || 'admin'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. AUTOMATIC NOTIFICATION
    try {
      const isPresent = status.toLowerCase() === 'present';
      await supabase.from('notifications').insert({
        school_id: schoolId,
        title: isPresent ? `Attendance: Present` : `Attendance Alert: ${status}`,
        message: isPresent 
          ? `Your child has arrived at school safely today (${formattedDate}).` 
          : `Your child was marked as ${status} today (${formattedDate}).`,
        student_id: studentId,
        created_at: new Date()
      });
    } catch (e) { console.error('Notification failed:', e.message); }

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get attendance by date/student
exports.getAttendance = async (req, res) => {
  try {
    const { date, studentId } = req.query;
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, data: [] });
    }

    let query = supabase
      .from('attendance')
      .select('*, students(name, roll_number, class)')
      .eq('school_id', req.user.schoolId);

    if (date) query = query.eq('date', date);
    if (studentId) query = query.eq('student_id', studentId);

    const { data: attendance, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get daily attendance status for all students
exports.getDailyStatus = async (req, res) => {
  try {
    const { date } = req.query;
    const formattedDate = new Date(date || new Date()).toISOString().split('T')[0];
    const schoolId = req.user.schoolId;

    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 1. Get all students
    const { data: students, error: stdError } = await supabase
      .from('students')
      .select('id, name, roll_number, class')
      .eq('school_id', schoolId);

    if (stdError) throw stdError;

    // 2. Get today's attendance
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .select('*')
      .eq('school_id', schoolId)
      .eq('date', formattedDate);

    if (attError) throw attError;

    // 3. Get all-time attendance for these students to calculate percentages
    // Optimization: In a real app, this would be a separate query or cached
    const { data: allAttendance, error: allAttError } = await supabase
      .from('attendance')
      .select('student_id, status, date')
      .eq('school_id', schoolId);

    if (allAttError) throw allAttError;

    const refNow = new Date();

    const data = students.map((student) => {
      const record = attendance.find((a) => a.student_id === student.id);

      const studentRecords = allAttendance.filter((a) => a.student_id === student.id);
      const totalMarked = studentRecords.length;
      const presentCount = studentRecords.filter((r) => isPresentOrLate(r.status)).length;

      const monthlyRecords = studentRecords.filter((r) => isDateInCalendarMonth(r.date, refNow));
      const monthlyMarked = monthlyRecords.length;
      const monthlyPresentCount = monthlyRecords.filter((r) => isPresentOrLate(r.status)).length;

      const attendancePercentage =
        totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;
      const monthlyAttendancePercentage =
        monthlyMarked > 0 ? Math.round((monthlyPresentCount / monthlyMarked) * 100) : 0;

      return {
        id: student.id,
        _id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        class: student.class,
        status: record ? record.status : 'Pending',
        attendanceId: record ? record.id : null,
        attendancePercentage,
        monthlyAttendancePercentage,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get attendance stats for a specific student
exports.getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.user.schoolId;

    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({
        success: true,
        data: {
          totalDays: 0,
          presentCount: 0,
          absentCount: 0,
          overallPercentage: 0,
          monthlyPercentage: 0,
          history: [],
        },
      });
    }

    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('status, date')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (error) throw error;

    const refNow = new Date();
    const totalMarked = attendance.length;
    const presentCount = attendance.filter((r) => isPresentOrLate(r.status)).length;
    const absentCount = attendance.filter((r) => (r.status || '').toString().toLowerCase().trim() === 'absent').length;

    const monthlyRecords = attendance.filter((r) => isDateInCalendarMonth(r.date, refNow));
    const monthlyMarked = monthlyRecords.length;
    const monthlyPresent = monthlyRecords.filter((r) => isPresentOrLate(r.status)).length;

    const overallPercentage =
      totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;
    const monthlyPercentage =
      monthlyMarked > 0 ? Math.round((monthlyPresent / monthlyMarked) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDays: totalMarked,
        presentCount,
        absentCount,
        overallPercentage,
        monthlyPercentage,
        history: attendance.slice(-10),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Reset attendance for a specific date
exports.resetDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query.date ? req.query : req.body;
    if (!date) return res.status(400).json({ success: false, error: 'Date is required' });

    const formattedDate = new Date(date).toISOString().split('T')[0];
    const schoolId = req.user.schoolId;

    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, message: 'Mock Reset' });
    }

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('school_id', schoolId)
      .eq('date', formattedDate);

    if (error) throw error;

    res.status(200).json({ success: true, message: `Attendance for ${formattedDate} has been reset.` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
