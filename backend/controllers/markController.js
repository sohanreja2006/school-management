const supabase = require('../config/supabase');

exports.saveMarks = async (req, res) => {
  try {
    const { exam, subject, marks } = req.body;
    
    if (!exam || !subject || !marks || !Array.isArray(marks)) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    const schoolId = req.user.schoolId;

    // 1. First, delete any existing marks for this specific Exam + Subject
    // This avoids the "Unique Constraint" error by clearing the way first
    const studentIds = marks.map(m => m.studentId);
    
    const { error: deleteError } = await supabase
      .from('marks')
      .delete()
      .eq('school_id', schoolId)
      .eq('exam_id', exam)
      .eq('subject_id', subject)
      .in('student_id', studentIds);

    if (deleteError) throw deleteError;

    // 2. Insert the new marks
    const insertData = marks.map(m => ({
      school_id: schoolId,
      student_id: m.studentId,
      exam_id: exam,
      subject_id: subject,
      marks_obtained: Number(m.marksObtained) || 0
    }));

    const { error: insertError } = await supabase
      .from('marks')
      .insert(insertData);

    if (insertError) throw insertError;
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[saveMarks] Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getStudentResult = async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    
    const { data: results, error } = await supabase
      .from('marks')
      .select('*, subjects(*), exams(*), students(*)')
      .eq('school_id', req.user.schoolId)
      .eq('student_id', studentId)
      .eq('exam_id', examId);

    if (error) throw error;

    let totalObtained = 0;
    let totalMax = 0;

    const formattedResults = results.map(r => {
      const obtained = r.marks_obtained || 0;
      const max = r.subjects?.max_marks || 100;
      totalObtained += obtained;
      totalMax += max;
      
      return {
        subject: r.subjects?.name || 'Unknown',
        obtained,
        max,
        percentage: max > 0 ? (obtained / max) * 100 : 0,
        status: obtained >= (r.subjects?.pass_marks || 33) ? 'Pass' : 'Fail'
      };
    });

    const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    let grade = 'F';
    if (overallPercentage >= 90) grade = 'A+';
    else if (overallPercentage >= 80) grade = 'A';
    else if (overallPercentage >= 70) grade = 'B';
    else if (overallPercentage >= 60) grade = 'C';
    else if (overallPercentage >= 50) grade = 'D';
    else if (overallPercentage >= 33) grade = 'E';

    const studentInfo = results[0]?.students ? {
      name: results[0].students.name,
      rollNumber: results[0].students.roll_number
    } : null;

    res.status(200).json({ 
      success: true, 
      data: {
        results: formattedResults,
        summary: {
          totalObtained,
          totalMax,
          percentage: overallPercentage.toFixed(2),
          grade
        },
        studentInfo
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getClassResults = async (req, res) => {
  try {
    const { className, examId } = req.query;
    
    const { data: students, error: stdError } = await supabase
      .from('students')
      .select('id, name, roll_number')
      .eq('school_id', req.user.schoolId)
      .eq('class', className);

    if (stdError) throw stdError;

    const studentIds = students.map(s => s.id);

    const { data: allMarks, error: marksError } = await supabase
      .from('marks')
      .select('*, subjects(*)')
      .eq('school_id', req.user.schoolId)
      .eq('exam_id', examId)
      .in('student_id', studentIds);

    if (marksError) throw marksError;

    const studentResults = students.map(student => {
      const studentMarks = allMarks.filter(m => m.student_id === student.id);
      const totalObtained = studentMarks.reduce((acc, curr) => acc + (curr.marks_obtained || 0), 0);
      const totalMax = studentMarks.reduce((acc, curr) => acc + (curr.subjects?.max_marks || 100), 0);
      
      return {
        _id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        totalObtained,
        totalMax,
        percentage: totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
      };
    });

    res.status(200).json({ success: true, data: studentResults.sort((a, b) => b.totalObtained - a.totalObtained) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getMarks = async (req, res) => {
  try {
    const { examId, subjectId } = req.query;
    if (!examId || !subjectId) {
      return res.status(400).json({ success: false, error: 'Exam ID and Subject ID are required' });
    }

    const { data: marks, error } = await supabase
      .from('marks')
      .select('student_id, marks_obtained')
      .eq('school_id', req.user.schoolId)
      .eq('exam_id', examId)
      .eq('subject_id', subjectId);

    if (error) throw error;
    
    const marksMap = {};
    marks.forEach(m => {
      marksMap[m.student_id] = m.marks_obtained;
    });

    res.status(200).json({ success: true, data: marksMap });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
