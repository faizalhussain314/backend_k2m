// src/services/otp.service.js
const { User } = require('../models/user.model');
const crypto = require('crypto');
const moment = require('moment');

// Generate OTP and save it to the user's document
const generateOtp = async (phoneNumber) => {
  const otp = crypto.randomBytes(3).toString('hex'); // 6-digit OTP (3 bytes hex)

  const otpExpiry = moment().add(10, 'minutes').toDate(); // OTP expires in 10 minutes

  // Find user by phone number and update OTP
  const user = await User.findOneAndUpdate(
    { phoneNumber },
    {
      'otp.code': otp,
      'otp.expiresAt': otpExpiry,
      'otp.sentAt': moment().toDate(),
    },
    { new: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  // Return OTP and its expiration time
  return { otp, expiresAt: otpExpiry };
};

// Verify OTP from the User model
const verifyOtp = async (phoneNumber, otp) => {
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new Error('User not found');
  }

  const otpRecord = user.otp;

  if (!otpRecord || otpRecord.code !== otp) {
    throw new Error('Invalid OTP');
  }

  if (moment().isAfter(moment(otpRecord.expiresAt))) {
    throw new Error('OTP has expired');
  }

  // OTP is valid, reset the OTP fields
  user.otp = {}; // Clear OTP fields after successful verification
  await user.save();

  return true; // OTP is valid
};

module.exports = {
  generateOtp,
  verifyOtp,
};
