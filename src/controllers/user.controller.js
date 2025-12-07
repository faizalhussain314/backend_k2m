const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { handleMongoError } = require('../utils/errorHandler');

const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const Response = require('./../config/response');


const createUser = catchAsync(async (req, res, next) => {

  try {
    const user = await userService.createUser(req.body);
    const response = Response(true, user, 'Success');
    res.status(httpStatus.CREATED).send(response);
  } catch (error) {
      return handleMongoError(error, next);
  }
});



const getUsers = catchAsync(async (req, res) => {

  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const getUserWithOutPagination = catchAsync(async (req, res) => {
 
  const user = await userService.getAllUsers(req);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});


const getUserPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role','phoneNumber','email']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const user = await userService.getAllUser(req, filter, options);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'admin not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getAdminPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'email','role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const user = await userService.getAllAdmins(req, filter, options);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'admin not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getUserByRole = catchAsync(async (req, res) => {
  const user = await userService.getUserByRoleId(req.params.roleIds);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getUserByEmailDetails = catchAsync(async (req, res) => {
  const user = await userService.gettUserByEmaiDetails(req.body.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});
const updatePassword = catchAsync(async (req, res) => {
  const user = await userService.updatePassword(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await userService.deleteUserById(req.params.userId);
  const response = Response(true, user, "User deleted successfully");
  res.status(httpStatus.OK).send(response);
});

const updateActiveStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { active } = req.body;

  // Ensure that the `active` field is provided and is a boolean
  if (typeof active !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Active status must be a boolean');
  }

  const user = await userService.updateUserById(userId, { active });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const response = Response(true, user, 'User active status updated successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  getUserByRole,
  updateUser,
  updatePassword,
  deleteUser,
  getUserWithOutPagination,
  updateActiveStatus,
  getUserByEmailDetails,
  getUserPagination,
  getAdminPagination
};
