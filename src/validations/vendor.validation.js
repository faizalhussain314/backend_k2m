const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const updateProfile = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string().optional(),
    address: Joi.string().optional(),
  }),
};

const createCustomer = {
  body: Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  }),
};
const getCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
};
const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  updateProfile,
  createCustomer,
  getCustomer,
  getOrder
};
