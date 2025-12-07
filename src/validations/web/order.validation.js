const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createOrder = {
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().custom(objectId).required(),
          quantity: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
    totalPrice: Joi.number().required(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('placed', 'packing', 'ready', 'dispatch', 'delivered','collected','completed').required(),
  }),
};

const updateVendorOrderStatus = {
  params: Joi.object().keys({
    vendorId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('placed', 'packing', 'ready', 'dispatch', 'delivered','collected','completed').required(),
    batch: Joi.string().valid('morning', 'evening').optional(),
  }),
};

const getReportValidation = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    productId: Joi.string().custom(objectId),
    status: Joi.string(),
    orderId: Joi.string().custom(objectId).optional()

  }),
};

module.exports = {
  createOrder,
  getOrder,
  updateStatus,
  updateVendorOrderStatus,
  getReportValidation
};
