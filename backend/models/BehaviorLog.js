const mongoose = require('mongoose');

const BehaviorLogSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true,
  },
  type: {
    type: String,
    enum: ['Positive', 'Negative'],
    required: true,
  },
  incident: {
    type: String,
    required: true,
  },
  actionTaken: String,
  recordedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  schoolId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BehaviorLog', BehaviorLogSchema);
