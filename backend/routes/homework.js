const express = require('express');
const { protect } = require('../middleware/auth');
const { getHomework, createHomework } = require('../controllers/homeworkController');
const router = express.Router();

router.use(protect);
router.get('/', getHomework);
router.post('/', createHomework);

module.exports = router;
