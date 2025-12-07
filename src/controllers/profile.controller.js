// src/controllers/profile.controller.js
const httpStatus = require('http-status');
const { User } = require('../models/user.model');
const  Vendor  = require('../models/vendor.model');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user without password
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Fetch vendor associated with user
    const vendor = await Vendor.findById(user.vendorId);
    if (!vendor) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found for this user');
    }

    // Fetch the main vendor's user (owner)
    const vendorUser = await User.findById(vendor.userId).select('-password');
    if (!vendorUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Associated vendor user not found');
    }

    // Prepare the response
    const response = {
      user,
      ...vendor.toObject()
    };

    // Include vendorUser only if current user is NOT the vendor owner
    if (!user._id.equals(vendor.userId)) {
      response.vendorUser = vendorUser;
    }

    res.status(httpStatus.OK).send(response);
  } catch (error) {
    res.status(error.statusCode || 500).send({
      message: error.message || 'Internal Server Error',
    });
  }
};


const getAdminProfile = async (req, res) => {
  
  const userId = req.user._id; // user ID from the authenticated user (from auth middleware)

  // Fetch the user without the password field
  const user = await User.findById(userId).select('-password'); 

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

    res.status(httpStatus.OK).send(user);
  
};


const AdminUpdate = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      email,
      phoneNumber,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    // Find the admin user
    const admin = await User.findById(userId);
    if (!admin) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    }
  if (phoneNumber && (await User.isPhoneTaken(phoneNumber, userId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already in use');
    }

    // Validate password change if new password is provided
    if (newPassword) {
      // Check if current password is provided
      if (!currentPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Current password is required to change password');
      }

      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
      }

      // Check if new password matches confirmation
      if (newPassword !== confirmPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'New password and confirmation do not match');
      }

      // Update password
      admin.password = newPassword;
    }

    // Update other fields
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.phoneNumber = phoneNumber || admin.phoneNumber;

    // Save the updated admin
    await admin.save();

    // Return the updated admin without password
    const updatedAdmin = await User.findById(userId).select('-password');
    
    res.status(httpStatus.OK).send({
      message: 'Admin details updated successfully',
      admin: updatedAdmin
    });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to update admin details');
  }
};





module.exports = {
  getProfile,
  getAdminProfile,
  AdminUpdate
};
