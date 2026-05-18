const supabase = require('../config/supabase');

// @desc    Get child dashboard data
exports.getChildData = async (req, res) => {
  try {
    if (req.user.role !== 'parent' || !req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const studentId = req.user.studentId;
    const schoolId = req.user.schoolId;

    // 1. Get student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 2. Get School Payment Info
    let schoolInfo = { upi_id: 'pending@upi', qr_code_url: '', name: 'School' };
    try {
      const { data: sData } = await supabase
        .from('schools')
        .select('upi_id, qr_code_url, name')
        .eq('id', schoolId)
        .single();
      if (sData) schoolInfo = sData;
    } catch (e) {}

    // 3. Safe Attendance Fetch
    let attendance = [];
    try {
      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });
      attendance = attData || [];
    } catch (e) {}

    // 4. Safe Marks Fetch
    let marks = [];
    try {
      const { data: marksData } = await supabase
        .from('marks')
        .select('*, subjects(name, max_marks), exams(name)')
        .eq('student_id', studentId);
      marks = marksData || [];
    } catch (e) {}

    // 5. Safe Fees Fetch (Handles missing table gracefully)
    let payments = [];
    try {
      const { data: feesData, error: fError } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });
      
      if (!fError) {
        payments = feesData || [];
      } else {
        console.warn('[getChildData] Fee Table missing or error:', fError.message);
      }
    } catch (e) {}

    // 6. Safe Notifications - Filter by parent/student
    let notifications = [];
    try {
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('school_id', schoolId)
        .or(`student_id.eq.${studentId},student_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (notifError) {
        console.error('[getChildData] Supabase notifications query error:', notifError);
      } else {
        notifications = notifData || [];
      }
    } catch (e) {
      console.error('[getChildData] Notifications catch block:', e);
    }

    // 7. Safe Schedules (Timetable)
    let schedules = [];
    try {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      
      const { data: schedData } = await supabase
        .from('timetables')
        .select('*, subjects(name)')
        .eq('school_id', schoolId)
        .eq('class', student.class)
        .eq('day', today)
        .order('start_time');
      
      schedules = schedData || [];
    } catch (e) {
      console.warn('[getChildData] Timetable fetch failed:', e.message);
    }

    // 8. Safe Homework Fetch
    let homework = [];
    try {
      const { data: hwData } = await supabase
        .from('homework')
        .select('*')
        .eq('school_id', schoolId)
        .eq('class', student.class)
        .order('due_date', { ascending: true });
      homework = hwData || [];
    } catch (e) {
      console.warn('[getChildData] Homework fetch failed:', e.message);
    }

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0";

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          class: student.class,
          rollNumber: student.roll_number,
          photo: student.photo,
          totalFees: student.total_fees || 0,
          paidFees: student.paid_fees || 0,
          balance: (student.total_fees || 0) - (student.paid_fees || 0)
        },
        school: schoolInfo,
        attendance: {
          percentage: attendancePercentage,
          totalDays,
          presentDays,
          history: attendance
        },
        marks: marks,
        fees: {
          total: student.total_fees || 0,
          paid: student.paid_fees || 0,
          balance: (student.total_fees || 0) - (student.paid_fees || 0),
          payments: payments
        },
        notifications,
        schedules,
        homework
      }
    });
  } catch (err) {
    console.error('[getChildData] Critical Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Process Fee Payment
exports.processPayment = async (req, res) => {
  try {
    const { method, transactionId } = req.body;
    const studentId = req.user.studentId;
    const schoolId = req.user.schoolId;

    // 1. AUTO-FETCH AMOUNT: Get the actual total and paid fees from the DB securely
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('total_fees, paid_fees')
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single();

    if (fetchError || !student) {
      throw new Error("Could not fetch student fee records.");
    }

    const totalFees = student.total_fees || 0;
    const paidFees = student.paid_fees || 0;
    const balanceDue = totalFees - paidFees;

    if (balanceDue <= 0) {
      return res.status(400).json({ success: false, error: 'No pending fees to pay.' });
    }

    // 2. Insert the payment record with the securely calculated balance
    const { data: payment, error: payError } = await supabase
      .from('fee_payments')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        amount_paid: balanceDue,
        payment_method: method || 'UPI',
        transaction_id: transactionId || `UPI_${Date.now()}`,
        payment_date: new Date(),
        status: 'Success'
      })
      .select()
      .single();

    if (payError) {
       if (payError.message.includes('relation "fee_payments" does not exist')) {
         return res.status(400).json({ success: false, error: 'DATABASE ERROR: Table "fee_payments" is missing. Please run the SQL setup script in Supabase.' });
       }
       throw payError;
    }

    // 3. Update the student's total paid fees
    const newPaidTotal = paidFees + balanceDue;
    await supabase
      .from('students')
      .update({ paid_fees: newPaidTotal })
      .eq('id', studentId)
      .eq('school_id', schoolId);

    // 4. Send Notification
    await supabase.from('notifications').insert({
      school_id: schoolId,
      title: 'Fee Payment Received',
      message: `Successfully received ₹${balanceDue}. Your balance has been cleared.`,
      student_id: studentId
    });

    res.status(200).json({ success: true, message: 'Payment recorded successfully', amount_paid: balanceDue });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get Digital Invoice (Professional PDF)
exports.getInvoice = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const schoolId = req.user.schoolId;
    const paymentId = req.params.id; // Optional: specific payment ID

    // 1. Fetch all necessary data
    const { data: student } = await supabase.from('students').select('*').eq('id', studentId).eq('school_id', schoolId).single();
    const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
    
    let payment = null;
    if (paymentId && paymentId !== 'latest') {
      const { data: pData } = await supabase.from('fee_payments').select('*').eq('id', paymentId).eq('school_id', schoolId).single();
      payment = pData;
    } else {
      const { data: pData } = await supabase.from('fee_payments').select('*').eq('student_id', studentId).eq('school_id', schoolId).order('payment_date', { ascending: false }).limit(1).single();
      payment = pData;
    }

    if (!student || !school) throw new Error('Data not found');

    // 2. Initialize PDFKit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${student.name.replace(/\s/g, '_')}.pdf`);

    // Stream the PDF to the response
    doc.pipe(res);

    // --- PDF DESIGN ---

    // Header: School Info
    doc.fillColor('#444444').fontSize(20).text(school.name.toUpperCase(), 50, 50, { align: 'right' });
    doc.fontSize(10).text(school.address || 'Official School Address', 50, 75, { align: 'right' });
    doc.text(`Contact: ${school.contact || 'N/A'}`, 50, 90, { align: 'right' });
    doc.moveDown();

    // Horizontal Line
    doc.strokeColor('#EEEEEE').lineWidth(1).moveTo(50, 115).lineTo(550, 115).stroke();

    // Invoice Title
    doc.fillColor('#333333').fontSize(24).text('FEE RECEIPT', 50, 140);
    doc.fontSize(10).text(`Receipt No: REC-${payment?.id?.substring(0,8) || Date.now()}`, 50, 170);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 185);

    // Student Details Box
    doc.rect(50, 210, 500, 80).fill('#F9FAFB');
    doc.fillColor('#1F2937').fontSize(12).text('STUDENT DETAILS', 65, 220, { underline: true });
    doc.fontSize(10).text(`Name: ${student.name}`, 65, 240);
    doc.text(`Class: ${student.class}`, 65, 255);
    doc.text(`Roll Number: ${student.roll_number}`, 65, 270);

    // Payment Details Table
    const tableTop = 320;
    doc.fillColor('#1F2937').fontSize(12).text('PAYMENT SUMMARY', 50, tableTop);
    
    // Table Headers
    doc.rect(50, tableTop + 20, 500, 25).fill('#4F46E5');
    doc.fillColor('#FFFFFF').fontSize(10).text('Description', 60, tableTop + 30);
    doc.text('Method', 250, tableTop + 30);
    doc.text('Amount', 450, tableTop + 30, { align: 'right' });

    // Table Content
    const rowY = tableTop + 55;
    doc.fillColor('#374151').text('School Tuition Fees', 60, rowY);
    doc.text(payment?.payment_method || 'UPI', 250, rowY);
    doc.text(`INR ${payment?.amount_paid?.toLocaleString() || '0'}`, 450, rowY, { align: 'right' });

    // Summary Line
    doc.strokeColor('#EEEEEE').lineWidth(1).moveTo(50, rowY + 20).lineTo(550, rowY + 20).stroke();

    // Totals
    const summaryY = rowY + 40;
    doc.fillColor('#6B7280').text('Total Paid:', 350, summaryY);
    doc.fillColor('#111827').text(`INR ${payment?.amount_paid?.toLocaleString() || '0'}`, 450, summaryY, { align: 'right' });

    doc.fillColor('#6B7280').text('Balance Due:', 350, summaryY + 20);
    doc.fillColor('#F43F5E').text(`INR ${(student.total_fees - student.paid_fees).toLocaleString()}`, 450, summaryY + 20, { align: 'right' });

    // Footer
    doc.fontSize(10).fillColor('#9CA3AF').text('This is a computer-generated receipt and does not require a physical signature.', 50, 700, { align: 'center', width: 500 });
    doc.fillColor('#4F46E5').text('Thank you for your timely payment!', 50, 715, { align: 'center', width: 500 });

    // Finalize the PDF
    doc.end();

  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate PDF. Please ensure pdfkit is installed.' });
  }
};

// @desc    Create Payment Intent (Stripe/Razorpay placeholder)
exports.createPaymentIntent = async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Payment gateway integration coming soon.',
    checkoutUrl: 'https://example.com/checkout' 
  });
};
