const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Function to handle MongoDB errors like duplicate keys.
 * @param {Error} error
 * @param {Function} next
 */
const handleMongoError = (error, next) => {
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyValue)[0];  // e.g., 'email'
    const value = error.keyValue[field];  // e.g., 'test@gmail.com'
    return next(new ApiError(httpStatus.BAD_REQUEST, `The ${field} "${value}" is already in use. Please provide a unique value.`));
  }

  // If it's not a MongoDB specific error, return a generic error
  return next(error);
};

module.exports = {
  handleMongoError
};
