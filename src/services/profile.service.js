// src/services/profile.service.js
const { User } = require('../models/user.model');
const ApiError = require('../utils/ApiError');

// Get user profile by ID
const getProfileById = async (userId) => {
  const user = await User.findById(userId).select('-password'); // Exclude password field

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

module.exports = {
  getProfileById,
};
