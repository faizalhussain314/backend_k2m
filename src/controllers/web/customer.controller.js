const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const customerService = require('../../services/web/customer.service');

const createCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  res.status(httpStatus.CREATED).send(customer);
});

const getCustomers = catchAsync(async (req, res) => {
  const customers = await customerService.getCustomers(req.query);
  res.status(httpStatus.OK).send(customers);
});

const getCustomerdata = async (req, res) => {  
  const customer = await customerService.getCustomerdata();
  res.status(200).json(customer);
};

const getCustomerById = catchAsync(async (req, res) => {
   const filter = {
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };

  const customer = await customerService.getCustomerById(req.params.customerId,filter);
  res.status(httpStatus.OK).send(customer);
});

const updateCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.customerId, req.body);
  res.status(httpStatus.OK).send(customer);
});

const deleteCustomer = catchAsync(async (req, res) => {
  await customerService.deleteCustomer(req.params.customerId);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateCustomerStatus = catchAsync(async (req, res) => {
  const customer = await customerService.updateCustomerStatus(req.params.customerId, req.body.isActive);
  res.status(httpStatus.OK).send(customer);
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerdata
};
