const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
} = require('../controllers/authController');

// Rate limit for actions that send OTPs (register + resend)
// Example: max 5 OTP emails per 15 minutes per IP
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      'Too many OTP requests from this IP, please try again after 15 minutes.',
  },
});

// Rate limit for OTP verification attempts
// Example: max 10 verify attempts per 15 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      'Too many OTP verification attempts, please try again after 15 minutes.',
  },
});

router.post('/login', loginUser);
router.post('/register', otpSendLimiter, registerUser);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/resend-otp', otpSendLimiter, resendOtp);

module.exports = router;
