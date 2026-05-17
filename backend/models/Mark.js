const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
  },
}, { timestamps: true });

// Ensure a student has only one mark entry per subject per exam
MarkSchema.index({ student: 1, exam: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Mark', MarkSchema);
