const Joi = require('joi');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    category: Joi.string().required(),
    subcategory: Joi.string().required(),
    price: Joi.number().positive().required(),
    unit: Joi.string().optional(),
    stock: Joi.number().min(0).default(0),
    image: Joi.string().optional(),
    description :Joi.string().optional(),
    
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().trim().optional(),
    category: Joi.string().optional(),
    subcategory: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    unit: Joi.string().optional(),
    stock: Joi.number().min(0).optional(),
    image: Joi.string().optional(),
    description :Joi.string().optional(),
    quickPicks :Joi.boolean().optional(),

  }),
};

const updateStatus = {
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    active: Joi.boolean().required(),
  }),
};
const updateQuickStatus = {
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    quickPicks: Joi.boolean().required(),
  }),
};

const updateNewlyStatus = {
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    newlyAdd: Joi.boolean().required(),
  }),
};
module.exports = {
  createProduct,
  updateProduct,
  updateStatus,
  updateQuickStatus,
  updateNewlyStatus
};
