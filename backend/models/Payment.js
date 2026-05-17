const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add payment amount'],
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Online', 'Manual Adjustment', 'Transfer', 'Cheque', 'Adjustment', 'UPI'],
    default: 'Cash',
  },
  receiptNumber: {
    type: String,
    unique: true,
  },
  transactionId: {
    type: String, // UTR / Reference ID
  },
  proofUrl: {
    type: String, // Screenshot URL
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Approved', // Default to approved for manual admin entries
  },
  remarks: {
    type: String,
  },
  schoolId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);
