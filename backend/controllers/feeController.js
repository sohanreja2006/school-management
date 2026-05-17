const supabase = require('../config/supabase');
const { rejectWithoutSupabase, isSupabaseConfigured } = require('../utils/saas');

// @desc    Record a payment
// @route   POST /api/fees/pay
// @access  Private (Admin only)
exports.recordPayment = async (req, res) => {
  try {
    const { studentId, amount, paymentMethod, remarks } = req.body;

    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Simulating payment.');
      return res.status(201).json({ 
        success: true, 
        data: { 
          id: 'mock_pay_' + Date.now(), 
          studentId, 
          amount, 
          receiptNumber: `REC-MOCK-${Date.now()}` 
        } 
      });
    }

    // Create payment record
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .insert([{
        school_id: req.user.schoolId,
        student_id: studentId,
        amount: Number(amount),
        payment_method: paymentMethod,
        remarks,
        receipt_number: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      }])
      .select()
      .single();

    if (payError) throw payError;

    // Update student paid fees
    const { data: student, error: stdError } = await supabase
      .from('students')
      .select('paid_fees')
      .eq('id', studentId)
      .eq('school_id', req.user.schoolId)
      .single();

    if (!stdError) {
      await supabase
        .from('students')
        .update({ paid_fees: (student.paid_fees || 0) + Number(amount) })
        .eq('id', studentId)
        .eq('school_id', req.user.schoolId);
    }

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get payment history
// @route   GET /api/fees/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.query;
    
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    let query = supabase
      .from('payments')
      .select('*, students(name, roll_number, class, total_fees, paid_fees)')
      .eq('school_id', req.user.schoolId)
      .order('created_at', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data: history, error } = await query;

    if (error) throw error;

    const mappedHistory = history.map(h => ({
      id: h.id,
      _id: h.id,
      student: h.students,
      amount: h.amount,
      paymentMethod: h.payment_method,
      remarks: h.remarks,
      receiptNumber: h.receipt_number,
      paymentDate: h.created_at
    }));

    res.status(200).json({ success: true, count: mappedHistory.length, data: mappedHistory });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get fee summary stats
// @route   GET /api/fees/stats
// @access  Private
exports.getFeeStats = async (req, res) => {
  try {
    if (rejectWithoutSupabase(res)) return;
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Returning mock fee stats.');
      return res.status(200).json({
        success: true,
        data: {
          totalExpected: 500000,
          totalCollected: 350000,
          pending: 150000,
          studentCount: 120
        }
      });
    }

    const { data: students, error } = await supabase
      .from('students')
      .select('total_fees, paid_fees')
      .eq('school_id', req.user.schoolId);

    if (error) throw error;

    const result = students.reduce((acc, curr) => {
      acc.totalExpected += Number(curr.total_fees || 0);
      acc.totalCollected += Number(curr.paid_fees || 0);
      acc.studentCount += 1;
      return acc;
    }, { totalExpected: 0, totalCollected: 0, studentCount: 0 });

    result.pending = result.totalExpected - result.totalCollected;

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all pending payments for verification
// @route   GET /api/fees/pending
// @access  Private (Admin)
exports.getPendingPayments = async (req, res) => {
  try {
    const { Payment } = require('../models/Payment'); // Use Mongoose model for complex queries
    const payments = await require('../models/Payment').find({ 
      schoolId: req.user.schoolId,
      status: 'Pending' 
    }).populate('student', 'name class rollNumber');

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Verify (Approve/Reject) a payment
// @route   PUT /api/fees/verify/:id
// @access  Private (Admin)
exports.verifyPayment = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const Payment = require('../models/Payment');
    const Student = require('../models/Student');

    const payment = await Payment.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = status;
    payment.remarks = remarks || payment.remarks;
    await payment.save();

    // If approved, update student's paid fees
    if (status === 'Approved') {
      const student = await Student.findById(payment.student);
      if (student) {
        student.paidFees = (student.paidFees || 0) + payment.amount;
        await student.save();
      }
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
