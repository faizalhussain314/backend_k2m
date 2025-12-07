const Joi = require('joi');

const updateBannerImages = {
  body: Joi.object().keys({
    banner_1: Joi.string().allow('').optional(),
    banner_2: Joi.string().allow('').optional(),
    banner_3: Joi.string().allow('').optional(),
  }),
};

const updatePosterImages = {
  body: Joi.object().keys({
    poster_1: Joi.string().allow('').optional(),
    poster_2: Joi.string().allow('').optional(),
    poster_3: Joi.string().allow('').optional(),
  }),
};

const getImageSettings = {
  query: Joi.object().keys({
    type: Joi.string().valid('banner', 'poster').optional(),
  }),
};

module.exports = {
  updateBannerImages,
  updatePosterImages,
  getImageSettings,
};