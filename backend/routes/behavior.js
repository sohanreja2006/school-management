const express = require('express');
const { protect } = require('../middleware/auth');
const { getLogs, createLog } = require('../controllers/behaviorController');
const router = express.Router();

router.use(protect);
router.get('/:studentId', getLogs);
router.post('/', createLog);

module.exports = router;
