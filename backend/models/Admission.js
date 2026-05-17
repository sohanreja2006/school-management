const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true,
  },
  parentName: {
    type: String,
    required: [true, 'Please add parent name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
  },
  grade: {
    type: String,
    required: [true, 'Please specify the grade/class for admission'],
  },
  address: {
    type: String,
    required: [true, 'Please add address'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Admission', AdmissionSchema);
