const Joi = require('joi');
const {objectId} = require('../custom.validation'); // Custom validation for ObjectId

const createSubcategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    category: Joi.string().required(),
    image: Joi.string().optional(),
    isActive: Joi.boolean(),
  }),
};

const updateSubcategory = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string(),
    image: Joi.string().optional(),
    isActive: Joi.boolean(),
  }),
};

const getSubcategory = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().custom(objectId).required(),
  }),
};
const getcategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};
const deleteSubcategory = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().custom(objectId).required(),
  }),
};

const updateStatus = {
  params: Joi.object().keys({
    subcategoryId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
  }),
};


module.exports = {
  createSubcategory,
  updateSubcategory,
  getSubcategory,
  deleteSubcategory,
  updateStatus,
  getcategory,
};
