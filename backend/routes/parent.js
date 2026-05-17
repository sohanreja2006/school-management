const express = require('express');
const { getChildData } = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('parent', 'admin'));

router.get('/child-data', getChildData);
const { createPaymentIntent, processPayment, getInvoice } = require('../controllers/parentController');

router.post('/create-payment-intent', createPaymentIntent);
router.post('/pay-fees', processPayment);
router.post('/process-payment', processPayment);
router.get('/invoice/:id', getInvoice);

module.exports = router;
