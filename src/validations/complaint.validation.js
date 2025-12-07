// /validations/web/complaint.validation.js
const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createComplaint = {
  body: Joi.object().keys({
    complaintType: Joi.string().required(),
    complaintDetails: Joi.string().required(),
  }),
};

const getComplaint = {
  params: Joi.object().keys({
    complaintId: Joi.string().custom(objectId),
  }),
};

const updateStatus = {
  params: Joi.object().keys({
    complaintId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('Pending', 'Resolved', 'In Progress').required(),
  }),
};

module.exports = {
  createComplaint,
  getComplaint,
  updateStatus,
};
