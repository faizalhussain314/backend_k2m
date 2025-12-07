// src/controllers/auth.controller.js
const httpStatus = require('http-status');
const { User } = require('../models/user.model');
const Vendor  = require('../models/vendor.model');

const otpService = require('../services/otp.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const { tokenTypes } = require('../config/tokens');
const { authService,  tokenService } = require('../services');

// Register a new user
const register = async (req, res) => {
  const { name, email, phoneNumber, password, role } = req.body;
  // Check if the phone number is already taken
  const isPhoneTaken = await User.isPhoneTaken(phoneNumber);
  if (isPhoneTaken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already in use');
  }

  // Create a new user
  const user = await User.create({ name, email, phoneNumber, password, role });
  // Create JWT Token (for user session)
  const token = jwt.sign(
    { sub: user._id, type: tokenTypes.ACCESS }, // Correct payload
    process.env.JWT_SECRET,  // Make sure this is the same secret as in passport.js
    { expiresIn: '1d' }
  );
  res.status(httpStatus.CREATED).send({
    message: 'User registered successfully!',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role ||  ' ',
    },
    token,
  });
};

// Login user
// const login = async (req, res) => {
//   const { phoneNumber, password } = req.body;

//   const user = await User.findOne({ phoneNumber });


//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid phone number or password');
//   }

//   if (!user.isActive) {
//     throw new ApiError(httpStatus.FORBIDDEN, 'Your account is inactive');
//   }

//   // Set token expiry conditionally: expires for admins, no expiry for others
//   const tokenExpiry = user.role === 'admin' ? '1d' : undefined; // undefined means no expiration

//   // Create JWT Token
//   const token = jwt.sign(
//     { sub: user._id, type: tokenTypes.ACCESS },
//     process.env.JWT_SECRET,
//     tokenExpiry ? { expiresIn: tokenExpiry } : {}  // pass options only if expiry is set
//   );

//   const userResponse = {
//     id: user._id,
//     phoneNumber: user.phoneNumber,
//     role: user.role,
//   };

//   if (user.role !== 'admin') {
//     userResponse.address = user.address;
//   }

//   res.status(httpStatus.OK).send({
//     message: 'Login successful',
//     user: userResponse,
//     token,
//   });
// };

const login = catchAsync(async (req, res) => {
  const { phoneNumber, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(phoneNumber, password);
  const tokens = await tokenService.generateAuthTokens(user);
    const userResponse = {
    id: user._id,
    phoneNumber: user.phoneNumber,
    role: user.role,
    name:user.name
  };

  if (user.role !== 'admin') {
    userResponse.address = user.address;
  }
    if (user.role === 'vendor') {
    const vendor = await Vendor.findOne({ userId: user._id });
    if (vendor) {
      userResponse.vendorId = vendor._id;
    }
  }
  res.status(httpStatus.OK).send({
    message: 'Login successful',
    user: userResponse,
    token:tokens.access.token,
  });
});

// Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
  const { phoneNumber } = req.body;

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User with this phone number not found');
  }

  // Generate OTP and save to user model
  const { otp, expiresAt } = await otpService.generateOtp(phoneNumber);

  // Send OTP to user (via SMS, email, etc.) (you can integrate an SMS service here)
  // In this case, we're just assuming OTP is successfully sent.

  res.send({
    message: `OTP sent successfully. It will expire at ${expiresAt}`,
  });
};

// Reset Password (Using OTP)
// const resetPassword = async (req, res) => {
//   const { phoneNumber, otp, password } = req.body;

//   const user = await User.findOne({ phoneNumber });

//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User with this phone number not found');
//   }

//   // Verify OTP from User model
//   const isOtpValid = await otpService.verifyOtp(phoneNumber, otp);

//   if (!isOtpValid) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
//   }

//   // Reset the user's password
//   user.password = password; // Set the new password
//   await user.save();

//   res.send({ message: 'Password reset successfully' });
// };

// User Logout (Handle JWT token invalidation or clearing session)
const logout = (req, res) => {
  // In case you're using JWT, you can handle logout here by clearing tokens
  res.send({ message: 'Logout successful' });
};




// const resetPassword = async (req, res) => {
//   const { idToken, newPassword } = req.body;

//   if (!idToken || !newPassword) {
//     return res.status(400).json({ error: 'Missing idToken or newPassword' });
//   }

//   try {
//     const decoded = await authService.verifyIdToken(idToken);
//     await authService.updateUserPassword(decoded.uid, newPassword);

//     res.status(200).json({ success: true, message: 'Password reset successful' });
//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// };



module.exports = {
  register,
  login,
  forgotPassword,
  // resetPassword,
  logout,
};












