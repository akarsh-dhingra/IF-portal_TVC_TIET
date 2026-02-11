const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const generateOTP = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');


// =============================
// Generate JWT
// =============================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


// =============================
// LOGIN USER
// =============================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check email verification
  if (!user.isVerified) {
    res.status(401);
    throw new Error('Please verify your email before login');
  }

  let profile = null;
  const role = user.role.toUpperCase();

  if (role === 'STUDENT') {
    profile = await Student.findOne({ userId: user._id });
  } else if (role === 'COMPANY') {
    profile = await Company.findOne({ userId: user._id });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    profile,
    token: generateToken(user._id),
  });
});


// =============================
// REGISTER USER
// =============================
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...profileData } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user (unverified by default)
  const user = await User.create({
    name,
    email,
    password,
    role: role.toUpperCase(),
    isVerified: false,
  });

  // Create role-based profile
  if (role.toLowerCase() === 'student') {
    await Student.create({
      userId: user._id,
      rollNo: profileData.rollNo || 'N/A',
      branch: profileData.branch || 'N/A',
      year: profileData.year || 'N/A',
      cgpa: 0,
    });
  } else if (role.toLowerCase() === 'company') {
    await Company.create({
      userId: user._id,
      name: profileData.name || user.name,
      description: profileData.industry || 'Tech',
      website: profileData.website || 'http://example.com',
      verified: false,
    });
  }

  // Generate OTP
  const otp = generateOTP();

  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Send OTP Email
  await sendEmail(
    user.email,
    'Verify Your Account',
    `Your OTP is ${otp}. It expires in 10 minutes.`
  );

  res.status(201).json({
    message: 'User registered successfully. Please verify OTP sent to your email.',
  });
});


// =============================
// VERIFY OTP
// =============================
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    return res.json({ message: 'User already verified' });
  }

  if (!user.otp || !user.otpExpires) {
    res.status(400);
    throw new Error('No OTP found. Please request a new one.');
  }

  if (user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error('OTP expired');
  }

  // Compare hashed OTP
  const isOtpMatch = await bcrypt.compare(otp, user.otp);

  if (!isOtpMatch) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Mark verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({
    message: 'Account verified successfully',
    token: generateToken(user._id),
  });
});


// =============================
// RESEND OTP
// =============================
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    return res.json({ message: 'User already verified' });
  }

  const otp = generateOTP();

  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(
    user.email,
    'Resend OTP',
    `Your new OTP is ${otp}. It expires in 10 minutes.`
  );

  res.json({ message: 'OTP resent successfully' });
});


module.exports = {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
};
