const express = require('express');
const { protect } = require('../middleware/auth');
const { getEvents, createEvent } = require('../controllers/eventController');
const router = express.Router();

router.use(protect);
router.get('/', getEvents);
router.post('/', createEvent);

module.exports = router;
