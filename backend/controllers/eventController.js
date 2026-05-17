const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ schoolId: req.user.schoolId }).sort({ startDate: 1 });
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      schoolId: req.user.schoolId
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
