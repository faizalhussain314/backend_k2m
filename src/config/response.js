// response.js

/**
 * Constructs a standard response object.
 * @param {boolean} success - Indicates whether the operation was successful.
 * @param {any} data - Data to include in the response.
 * @param {string} message - Message describing the outcome.
 * @returns {object} Standard response object.
 */
const Response = (success, data, message) => {
    return {
      success: success,
      data: data,
      message: message
    };
  };
  
  module.exports = Response;
  