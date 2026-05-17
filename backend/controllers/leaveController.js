const LeaveRequest = require('../models/LeaveRequest');

// @desc    Get all leave requests
// @route   GET /api/leaves
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ schoolId: req.user.schoolId }).populate('user', 'name');
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
exports.applyLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.create({
      ...req.body,
      user: req.user.id,
      schoolId: req.user.schoolId
    });
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
