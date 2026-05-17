const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true,
  },
  class: {
    type: String,
    required: [true, 'Please add class'],
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add roll number'],
    unique: true,
  },
  contact: {
    type: String,
    required: [true, 'Please add contact number'],
  },
  parentName: {
    type: String,
    required: [true, 'Please add parent name'],
  },
  parentEmail: {
    type: String,
  },
  address: {
    type: String,
  },
  totalFees: {
    type: Number,
    required: [true, 'Please assign total fees'],
  },
  paidFees: {
    type: Number,
    default: 0,
  },
  attendancePercentage: {
    type: Number,
    default: 0,
  },
  monthlyAttendancePercentage: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', StudentSchema);
