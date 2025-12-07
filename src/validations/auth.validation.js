// src/validations/auth.validation.js
const Joi = require('joi');


const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('customer', 'vendor', 'admin').required(),
  }),
};
const login = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
  }),
};
const resetPassword = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
    otp: Joi.string().required(),
    password: Joi.string().min(8).required(),  }),
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
