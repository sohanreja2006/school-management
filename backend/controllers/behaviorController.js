const BehaviorLog = require('../models/BehaviorLog');

// @desc    Get student behavior logs
// @route   GET /api/behavior/:studentId
exports.getLogs = async (req, res) => {
  try {
    const logs = await BehaviorLog.find({ 
      student: req.params.studentId,
      schoolId: req.user.schoolId 
    }).populate('recordedBy', 'name');
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create log
// @route   POST /api/behavior
exports.createLog = async (req, res) => {
  try {
    const log = await BehaviorLog.create({
      ...req.body,
      recordedBy: req.user.id,
      schoolId: req.user.schoolId
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
