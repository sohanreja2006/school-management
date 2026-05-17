const express = require('express');
const { protect } = require('../middleware/auth');
const { getLeaves, applyLeave, updateLeaveStatus } = require('../controllers/leaveController');
const router = express.Router();

router.use(protect);
router.get('/', getLeaves);
router.post('/', applyLeave);
router.put('/:id', updateLeaveStatus);

module.exports = router;
