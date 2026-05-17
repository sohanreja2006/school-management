const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  startTime: {
    type: String,
    required: true, // e.g., "09:00 AM"
  },
  endTime: {
    type: String,
    required: true, // e.g., "10:00 AM"
  },
  subject: {
    type: String,
    required: true,
  },
  teacher: {
    type: String,
    required: true,
  },
  room: {
    type: String,
  },
});

module.exports = mongoose.model('Timetable', TimetableSchema);
