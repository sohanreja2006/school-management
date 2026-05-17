const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present',
  },
  markedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Prevent multiple attendance marks for same student on same day
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Static method to get attendance stats and update Student model
AttendanceSchema.statics.updateStudentStats = async function(studentId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [overallStats, monthlyStats] = await Promise.all([
    this.aggregate([
      { $match: { student: studentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { student: studentId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const calculatePercentage = (stats) => {
    let total = 0;
    let present = 0;
    stats.forEach(stat => {
      total += stat.count;
      if (stat._id === 'Present') present += stat.count;
    });
    return total > 0 ? (present / total) * 100 : 0;
  };

  const overallPercentage = calculatePercentage(overallStats);
  const monthlyPercentage = calculatePercentage(monthlyStats);

  await mongoose.model('Student').findByIdAndUpdate(studentId, {
    attendancePercentage: overallPercentage.toFixed(2),
    monthlyAttendancePercentage: monthlyPercentage.toFixed(2)
  });
};

// Call updateStudentStats after save
AttendanceSchema.post('save', function() {
  this.constructor.updateStudentStats(this.student);
});

// Call updateStudentStats after remove
AttendanceSchema.post('remove', function() {
  this.constructor.updateStudentStats(this.student);
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
