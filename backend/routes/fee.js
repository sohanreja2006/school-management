const express = require('express');
const {
  recordPayment,
  getPaymentHistory,
  getFeeStats,
  getPendingPayments,
  verifyPayment
} = require('../controllers/feeController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/pay', authorize('admin'), recordPayment);
router.get('/pending', authorize('admin'), getPendingPayments);
router.put('/verify/:id', authorize('admin'), verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/stats', getFeeStats);

module.exports = router;
