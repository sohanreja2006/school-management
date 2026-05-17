const Homework = require('../models/Homework');

// @desc    Get all homework
// @route   GET /api/homework
exports.getHomework = async (req, res) => {
  try {
    const homework = await Homework.find({ schoolId: req.user.schoolId }).populate('teacher', 'name');
    res.status(200).json({ success: true, data: homework });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new homework
// @route   POST /api/homework
exports.createHomework = async (req, res) => {
  try {
    const homework = await Homework.create({
      ...req.body,
      teacher: req.user.id,
      schoolId: req.user.schoolId
    });
    res.status(201).json({ success: true, data: homework });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
