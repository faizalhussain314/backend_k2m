const Joi = require('joi');

const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(3).max(30),
    profilePic: Joi.string().trim().uri().optional(),
  }),
};

const addAddress = {
  body: Joi.object().keys({
    street: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    pincode: Joi.string().trim().pattern(/^\d{5,6}$/).required().messages({
      "string.pattern.base": "Pincode must be 5 or 6 digits",
    }),
    isDefault: Joi.boolean().default(false),
  }),
};

const addToCart = {
  body: Joi.object().keys({
    productId: Joi.string().trim().hex().length(24).required(),
    quantity: Joi.number().required(),
  }),
};
const getVendor = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().trim().pattern(/^\d{10}$/).required().messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),
  }),
};
const placeOrder = {
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object().keys({
          productId: Joi.string().trim().hex().length(24).required(),
          quantity: Joi.number().required(),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "Order must contain at least one item",
      }),
  }),
};

const cancelOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().trim().hex().length(24).required(),
  }),
};

const deleteAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().trim().hex().length(24).required(),
  }),
};

module.exports = {
  updateProfile,
  addAddress,
  addToCart,
  placeOrder,
  cancelOrder,
  deleteAddress,
  getVendor
};
