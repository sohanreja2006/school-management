const express = require('express');
const {
  markAttendance,
  getAttendance,
  getStudentStats,
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getAttendance).post(markAttendance);
router.route('/daily-status').get(require('../controllers/attendanceController').getDailyStatus);
router.route('/reset').delete(require('../controllers/attendanceController').resetDailyAttendance);
router.route('/stats/:studentId').get(getStudentStats);

module.exports = router;
