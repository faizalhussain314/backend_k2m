const Joi = require('joi');

const createSlot = {
  body: Joi.object().keys({
    name: Joi.string().valid('Morning', 'Evening').required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
  }),
};

const updateSlot = {
  body: Joi.object().keys({
    name: Joi.string().valid('Morning', 'Evening'),
    startTime: Joi.string(),
    endTime: Joi.string(),
    isActive: Joi.boolean(),
  }),
};

module.exports = {
  createSlot,
  updateSlot,
};
