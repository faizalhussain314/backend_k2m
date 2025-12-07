const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    // gender: Joi.string(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    timeZone: Joi.string(),
    userType: Joi.string(),
    deviceInfoHash: Joi.string(),
    // password: Joi.string().custom(password),
    avatar: Joi.string(),
    active: Joi.boolean(),
    lastSeen: Joi.date(),
    socialUniqueId: Joi.string(),
    mobileApplicationType: Joi.string().valid('ANDROID', 'IOS'),
    token: Joi.string(),
    countryCode: Joi.string().custom(objectId),
    rememberToken: Joi.string(),
    profilePic: Joi.string(),
    referralCode: Joi.string(),
    onlineBy: Joi.number().integer(),
    blockReson: Joi.string(),
    language: Joi.string().custom(objectId),
    address: Joi.string(),
    emergencyNumber: Joi.string(),
    userReferralCode: Joi.string(),
    otp: Joi.string(),
    demoKey: Joi.string(),
    country: Joi.string().custom(objectId).optional(),
    tripsCount: Joi.number().integer(),
    otpExpiresAt: Joi.date(),
    createdBy: Joi.number().integer(),
    adminDemoKey: Joi.string(),
    rating: Joi.number().integer(),
    othersUserId: Joi.number().integer(),
    // country.Joi.number().
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string().required(),
      // gender: Joi.string(),
      roleIds: Joi.array().items(Joi.string().custom(objectId)),
      timeZone: Joi.string(),
      userType: Joi.string(),
      deviceInfoHash: Joi.string(),
      avatar: Joi.string(),
      active: Joi.boolean(),
      lastSeen: Joi.date(),
      socialUniqueId: Joi.string(),
      mobileApplicationType: Joi.string().valid('ANDROID', 'IOS'),
      token: Joi.string(),
      countryCode: Joi.string().custom(objectId),
      rememberToken: Joi.string(),
      profilePic: Joi.string(),
      referralCode: Joi.string(),
      onlineBy: Joi.number().integer(),
      blockReson: Joi.string(),
      language: Joi.string().custom(objectId),
      address: Joi.string(),
      emergencyNumber: Joi.string(),
      userReferralCode: Joi.string(),
      otp: Joi.string(),
      demoKey: Joi.string(),
      // country: Joi.string().custom(objectId),
      tripsCount: Joi.number().integer(),
      otpExpiresAt: Joi.date(),
      createdBy: Joi.number().integer(),
      adminDemoKey: Joi.string(),
      rating: Joi.number().integer(),
      othersUserId: Joi.number().integer(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getUserByEmail = {
  body: Joi.object().keys({
    email: Joi.string().required(),
  }),
};


const getUserByRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const updateActiveStatus = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    active: Joi.boolean().required(),
  }),
};
const updateProfile = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),  
      phoneNumber: Joi.string().optional(), 
    })
    .min(1), 
};
const updatePassword = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      newpassword: Joi.string().required(),  
    })
    .min(1), 
};
module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserByRole,
  updateActiveStatus,
  getUserByEmail,
  updateProfile,
  updatePassword
};
