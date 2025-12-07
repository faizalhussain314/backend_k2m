const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createVendor = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().optional().allow(''), 
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(8).required(),
    vendorCode: Joi.string().required(),
    address: Joi.string().required(),
    serviceLocations: Joi.any().required(),

  }),
};

const updateVendor = {
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().optional().allow(''), 
    phoneNumber: Joi.string(),
    password: Joi.string().min(8),
    govtId: Joi.string(),
    address: Joi.string(),
    vendorCode: Joi.string(),
    serviceLocations:Joi.any(),
  }),
};

const changeVendorStatus = {
  params: Joi.object().keys({
    vendorId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('active', 'inactive', 'suspended').required(),
  }),
};

module.exports = {
  createVendor,
  updateVendor,
  changeVendorStatus,
};
