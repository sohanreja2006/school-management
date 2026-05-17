const { register, login, getMe, requestOTP, oauthSync, completeProfile, updateProfile } = require('../controllers/authController');
const { requestOtp, verifyOtp } = require('../controllers/parentAuthController');
const { protect } = require('../middleware/auth');
const {
  registerLimiter,
  authLoginLimiter,
  parentAuthLimiter,
} = require('../middleware/rateLimiters');

const express = require('express');
const { getVirtualInbox } = require('../utils/email');

const router = express.Router();

router.post('/request-signup-otp', registerLimiter, requestOTP);
router.post('/register', registerLimiter, register);
router.post('/login', authLoginLimiter, login);
router.post('/oauth-sync', authLoginLimiter, oauthSync);
router.post('/complete-profile', protect, completeProfile);
router.put('/update-profile', protect, updateProfile);
router.get('/me', protect, getMe);

// Debug Route for Virtual Inbox (Unlimited OTP testing)
router.get('/debug/virtual-inbox', (req, res) => {
  res.json({ success: true, emails: getVirtualInbox() });
});

// Parent OTP Auth Routes
router.post('/parent/request-otp', parentAuthLimiter, requestOtp);
router.post('/parent/verify-otp', parentAuthLimiter, verifyOtp);
router.get('/parent/ping', (req, res) => res.json({ message: 'Pong', timestamp: new Date() }));

module.exports = router;
