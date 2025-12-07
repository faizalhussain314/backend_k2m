// controllers/settings.controller.js

const httpStatus = require('http-status');
const settingsService = require('../../services/web/setting.service');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const updateBannerImages = catchAsync(async (req, res) => {
  // Use req.files for uploaded files and req.body for existing paths
  const bannerData = {};
  
  // Process uploaded files
  if (req.files) {
    if (req.files['banner_1']) {
      bannerData.banner_1 = req.files['banner_1'][0].path;
    }
    if (req.files['banner_2']) {
      bannerData.banner_2 = req.files['banner_2'][0].path;
    }
    if (req.files['banner_3']) {
      bannerData.banner_3 = req.files['banner_3'][0].path;
    }
  }
  
  // Process existing paths from body
  if (req.body.banner_1) {
    bannerData.banner_1 = req.body.banner_1;
  }
  if (req.body.banner_2) {
    bannerData.banner_2 = req.body.banner_2;
  }
  if (req.body.banner_3) {
    bannerData.banner_3 = req.body.banner_3;
  }
  const updatedSettings = await settingsService.updateImageSettings('banner', bannerData);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Banner images updated successfully',
    data: updatedSettings,
  });
});

const updatePosterImages = catchAsync(async (req, res) => {
  const posterData = {};
  
  // Process uploaded files
  if (req.files) {
    if (req.files['poster_1']) {
      posterData.poster_1 = req.files['poster_1'][0].path;
    }
    if (req.files['poster_2']) {
      posterData.poster_2 = req.files['poster_2'][0].path;
    }
    if (req.files['poster_3']) {
      posterData.poster_3 = req.files['poster_3'][0].path;
    }
  }
  
  // Process existing paths from body
  if (req.body.poster_1) {
    posterData.poster_1 = req.body.poster_1;
  }
  if (req.body.poster_2) {
    posterData.poster_2 = req.body.poster_2;
  }
  if (req.body.poster_3) {
    posterData.poster_3 = req.body.poster_3;
  }

  const updatedSettings = await settingsService.updateImageSettings('poster', posterData);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Poster images updated successfully',
    data: updatedSettings,
  });
});

const getImageSettings = catchAsync(async (req, res) => {
  const { type } = req.query;
  
  const settings = await settingsService.getImageSettings({ type });
  
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Image settings retrieved successfully',
    data: settings,
  });
});

const getBannerImages = catchAsync(async (req, res) => {
  const banners = await settingsService.getBannerImages();
  
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Banner images retrieved successfully',
    data: banners,
  });
});

const getPosterImages = catchAsync(async (req, res) => {
  const posters = await settingsService.getPosterImages();
  
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Poster images retrieved successfully',
    data: posters,
  });
});



module.exports = {
  updateBannerImages,
  updatePosterImages,
  getImageSettings,
  getBannerImages,
  getPosterImages,
 
};