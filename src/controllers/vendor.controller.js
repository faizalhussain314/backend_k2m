// controllers/vendor.controller.js

const httpStatus = require('http-status');
const vendorService = require('../services/vendor.service');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Vendor = require('../models/vendor.model');
const { User } = require('../models/user.model');

exports.getProfile = catchAsync(async (req, res) => {
  const profile = await vendorService.getProfile(req.user._id);
  res.status(httpStatus.OK).send(profile);
});

exports.updateProfile = catchAsync(async (req, res) => {
  const vendor = await vendorService.updateProfile(req.user._id, req.body);
  res.status(httpStatus.OK).send(vendor);
});

exports.getOrderStats = catchAsync(async (req, res) => {
  const stats = await vendorService.getOrderStats(req.user._id);
  res.status(httpStatus.OK).send(stats);
});

exports.getWeeklyReport = catchAsync(async (req, res) => {
  const report = await vendorService.getWeeklyReport(req.user._id);
  res.status(httpStatus.OK).send(report);
});

exports.getDeliveries = catchAsync(async (req, res) => {
  const deliveries = await vendorService.getDeliveries(req.user._id);
  res.status(httpStatus.OK).send(deliveries);
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await vendorService.getOrders(req.user._id, req.query);
  res.status(httpStatus.OK).send(orders);
});

exports.getOrderDetail = catchAsync(async (req, res) => {
  const order = await vendorService.getOrderDetail(req.user._id, req.params.orderId);
  res.status(httpStatus.OK).send(order);
});

exports.createCustomer = catchAsync(async (req, res) => {
  const customer = await vendorService.createCustomer(req.user._id, req.body);
  res.status(httpStatus.CREATED).send(customer);
});


exports.getCustomerById = catchAsync(async (req, res) => {
   const filter = {
      page: req.query.page || 1,
      limit: req.query.limit || 5
    };

  const customer = await vendorService.getCustomerById(req.params.customerId,filter);
  res.status(httpStatus.OK).send(customer);
});


exports.getOrderById = catchAsync(async (req, res) => {
  const order = await vendorService.getOrderById(req.params.orderId);
  res.status(httpStatus.OK).send(order);
});


exports.getVendorOrdersMorning = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const vendorId = await Vendor.findOne({ userId });
  const orders = await vendorService.getVendorOrdersMorning(vendorId,req.query);
  res.status(httpStatus.OK).send(orders);
});


exports.getVendorById = async (req, res) => {
  try {
   const userFilter = {
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };
    const usersData = await vendorService.getVendorUsersOnly(
      req.params.vendorId,
      userFilter
    );

    res.status(200).json(usersData);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || 'Internal Server Error',
    });
  }
};


exports.getWeeklyOrdersCount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  const result = await vendorService.getWeeklyOrdersCount(vendor._id);
  res.status(httpStatus.OK).send(result);
});

exports.resetCustomer = catchAsync(async (req, res) => {
  const customerId = req.params.customerId;

  const customer = await User.findOne({ _id: customerId, role: 'customer' });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const { phoneNumber } = customer;

  if (!phoneNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Customer phone number not found');
  }

  customer.password = phoneNumber; 
  await customer.save();

  res.status(httpStatus.OK).send({ message: 'Customer password reset successfully' });
});
