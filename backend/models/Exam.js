const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "1st Term", "Unit Test 1"
  },
  type: {
    type: String,
    enum: ['Unit Test', 'Term', 'Mid Term', 'Final'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  classes: [{
    type: String, // e.g., ["10th A", "10th B"]
  }],
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming',
  },
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
