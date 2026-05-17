const StaffSalary = require('../models/StaffSalary');

// @desc    Get all salaries
// @route   GET /api/payroll
exports.getSalaries = async (req, res) => {
  try {
    const salaries = await StaffSalary.find({ schoolId: req.user.schoolId }).populate('staff', 'name');
    res.status(200).json({ success: true, data: salaries });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Process salary
// @route   POST /api/payroll
exports.processSalary = async (req, res) => {
  try {
    const salary = await StaffSalary.create({
      ...req.body,
      schoolId: req.user.schoolId
    });
    res.status(201).json({ success: true, data: salary });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
