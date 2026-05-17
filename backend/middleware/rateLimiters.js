const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 10 : 100,
  message: { success: false, message: 'Too many registration attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 30 : 200,
  message: { success: false, message: 'Too many login attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const parentAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 40 : 300,
  message: { success: false, message: 'Too many attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 800 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  registerLimiter,
  authLoginLimiter,
  parentAuthLimiter,
  apiLimiter,
};
