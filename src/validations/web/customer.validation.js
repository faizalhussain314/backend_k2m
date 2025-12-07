const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createCustomer = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    phoneNumber: Joi.string().required().pattern(/^\d+$/).min(10).max(15),
    password: Joi.string().min(8).required(),
    email: Joi.string().optional().allow(''), 
    isVeg: Joi.boolean().optional(),
    vendorId: Joi.string().optional(),
    address: Joi.string().optional(),
    mapUrl: Joi.string().optional(), 
    latitude: Joi.number().optional().min(-90).max(90), 
    longitude: Joi.number().optional().min(-180).max(180), 
    landMark: Joi.string().optional(),
  }),
};

const getCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
};

const updateCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    phoneNumber: Joi.string().pattern(/^\d+$/).min(10).max(15),
    password: Joi.string().min(8),
    email: Joi.string().optional().allow(''), 
    isVeg: Joi.boolean().optional(),
    address: Joi.string(),  
    vendorId: Joi.string().optional(),
    latitude: Joi.number().optional().min(-90).max(90), 
    longitude: Joi.number().optional().min(-180).max(180), 
    landMark: Joi.string().optional(),
    mapUrl: Joi.string(),
  }),
};

const deleteCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
};

const updateStatus = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
  }),
};

module.exports = {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  updateStatus,
};
