const express = require('express');
const validate = require('../../../middlewares/validate');
const auth = require('../../../middlewares/auth');
const settingsValidation = require('../../../validations/web/setting.validation');
const settingsController = require('../../../controllers/web/setting.controller');
const upload = require('../../../middlewares/upload'); // Import multer middleware

const router = express.Router();

// Update banner images
router.patch(
  '/banners',
    upload.fields([
    { name: 'banner_1', maxCount: 1 },
    { name: 'banner_2', maxCount: 1 },
   { name: 'banner_3', maxCount: 1 }

  ]),
  settingsController.updateBannerImages
);

// Update poster images
router.patch(
  '/posters',
     upload.fields([
    { name: 'poster_1', maxCount: 1 },
    { name: 'poster_2', maxCount: 1 },
   { name: 'poster_3', maxCount: 1 }

  ]),
  settingsController.updatePosterImages
);

// Get all image settings
router.get(
  '/images',
  validate(settingsValidation.getImageSettings),
  settingsController.getImageSettings
);

// Get banner images only
router.get(
  '/banners',
  settingsController.getBannerImages
);

// Get poster images only
router.get(
  '/posters',
  settingsController.getPosterImages
);





module.exports = router;