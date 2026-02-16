const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');

const { sendEmail } = require('../utils/workingGmailService');


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

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error('Please verify your email before login');
  }

  let profile = null;

  if (user.role === 'STUDENT') {
    profile = await Student.findOne({ userId: user._id });
  } else if (user.role === 'COMPANY') {
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
    throw new Error('Please add all required fields');
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isVerified) {
      await User.deleteOne({ _id: existingUser._id });
      console.log(`Deleted unverified user: ${email}`);
    } else {
      res.status(400);
      throw new Error('User already exists');
    }
  }

  // Create unverified user
  const user = await User.create({
    name,
    email,
    password,
    role: role.toUpperCase(),
    isVerified: false,
  });

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Save OTP FIRST (important)
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Email HTML
  const emailHtml = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing:5px;">${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    </div>
  `;

  const emailResult = await sendEmail(
    user.email,
    'Verify Your Account - OTP Code',
    `Your OTP is ${otp}`,
    emailHtml
  );

  if (!emailResult.success) {
    res.status(500);
    throw new Error('Failed to send verification email');
  }

  res.status(201).json({
    message: 'Registration successful. Please verify OTP sent to email.',
    requiresVerification: true,
    email: user.email,
  });
});


// =============================
// VERIFY OTP
// =============================
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, profileData } = req.body;

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
    throw new Error('No OTP found. Please request new OTP.');
  }

  if (user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error('OTP expired');
  }

  const isMatch = await bcrypt.compare(otp, user.otp);

  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Mark verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // Create role profile
  let profile = null;

  if (user.role === 'STUDENT') {
    profile = await Student.create({
      userId: user._id,
      rollNo: profileData?.rollNo || 'N/A',
      branch: profileData?.branch || 'N/A',
      year: profileData?.year || 'N/A',
      cgpa: 0,
    });
  }

  if (user.role === 'COMPANY') {
    profile = await Company.create({
      userId: user._id,
      name: profileData?.name || user.name,
      description: profileData?.industry || 'Tech',
      website: profileData?.website || 'http://example.com',
      verified: false,
    });
  }

  res.json({
    message: 'Account verified successfully',
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
    },
    role: user.role.toLowerCase(),
    profile,
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

  const otp = crypto.randomInt(100000, 999999).toString();

  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(
    user.email,
    'Resend OTP',
    `Your new OTP is ${otp}`,
    `<h2>Your new OTP is: ${otp}</h2>`
  );

  res.json({ message: 'OTP resent successfully' });
});


module.exports = {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
};
