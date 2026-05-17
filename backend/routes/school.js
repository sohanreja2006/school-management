const express = require('express');
const { 
  updatePaymentSettings, 
  getPaymentSettings,
  addStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  staffLogin
} = require('../controllers/schoolController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Public route for mobile app login
router.post('/staff-login', staffLogin);

router.use(protect);

router.get('/payment-settings', getPaymentSettings);
router.put('/payment-settings', authorize('admin'), updatePaymentSettings);

// Staff management routes
router.get('/staff', getStaff);
router.post('/staff', authorize('admin'), addStaff);
router.put('/staff/:id', authorize('admin'), updateStaff);
router.delete('/staff/:id', authorize('admin'), deleteStaff);

module.exports = router;
