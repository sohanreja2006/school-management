const Notification = require('../models/Notification');

exports.createFeeNotification = async (student, amount) => {
  await Notification.create({
    title: 'Pending Fee Reminder',
    message: `Student ${student.name} (Roll: ${student.rollNumber}) has a pending balance of $${amount}.`,
    type: 'Fee',
    recipient: student._id
  });
};

exports.createAbsenceNotification = async (student, date) => {
  await Notification.create({
    title: 'Student Absentee Alert',
    message: `Student ${student.name} was marked absent on ${new Date(date).toLocaleDateString()}.`,
    type: 'Attendance',
    recipient: student._id
  });
};
