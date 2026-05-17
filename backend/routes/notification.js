// Notification Routes
const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAsRead, sendAlert } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.post('/', createNotification);
router.post('/alert', sendAlert);
router.put('/:id/read', markAsRead);

module.exports = router;
