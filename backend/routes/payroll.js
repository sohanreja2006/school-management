const express = require('express');
const { protect } = require('../middleware/auth');
const { getSalaries, processSalary } = require('../controllers/payrollController');
const router = express.Router();

router.use(protect);
router.get('/', getSalaries);
router.post('/', processSalary);

module.exports = router;
