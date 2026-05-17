const express = require('express');
const { updateLocation, getLocations, driverLogin } = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Driver Auth endpoint
router.post('/driver-login', driverLogin);

// Driver app endpoint (Public for simplicity, or protect with API key)
router.post('/location', updateLocation);

// Admin/Parent endpoint (Protected)
router.get('/locations', protect, getLocations);

module.exports = router;
