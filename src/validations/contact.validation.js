const Joi = require('joi');

const createContact = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    mobile: Joi.string().required(),
    address: Joi.string().required(),
  }),
};

module.exports = {
  createContact,
};
