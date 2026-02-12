const crypto = require('crypto');

// Generate a 6 digit numeric OTP as a string
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = generateOTP;
