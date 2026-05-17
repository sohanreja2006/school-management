const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Mathematics"
  },
  code: {
    type: String, // e.g., "MATH101"
  },
  class: {
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100,
  },
  passMarks: {
    type: Number,
    required: true,
    default: 33,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
