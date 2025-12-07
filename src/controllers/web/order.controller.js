const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const orderService = require('../../services/web/order.service');

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getOrders(req.user,req.query);
  res.status(httpStatus.OK).send(orders);
});

const getVendorOrdersEvening = catchAsync(async (req, res) => {
  const orders = await orderService.getVendorOrdersEvening(req.params.vendorId,req.query);
  res.status(httpStatus.OK).send(orders);
});
const getVendorOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getVendorOrders(req.params.vendorId,req.query);
  res.status(httpStatus.OK).send(orders);
});


const getVendorOrdersMorning = catchAsync(async (req, res) => {
  const orders = await orderService.getVendorOrdersMorning(req.params.vendorId,req.query);
  res.status(httpStatus.OK).send(orders);
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  res.status(httpStatus.OK).send(order);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.orderId, req.body.status);
  res.status(httpStatus.OK).send(order);
});
const updateVendorOrderStatus = catchAsync(async (req, res) => {
  const { vendorId } = req.params;
  const { status, batch } = req.body;

  const result = await orderService.updateVendorOrderStatus(vendorId, status, batch);
  res.status(httpStatus.OK).send(result);
});

const generateReport = catchAsync(async (req, res) => {
  const report = await orderService.generateReport(req.query);
  console.log(report);
  res.status(httpStatus.OK).send(report);
});

const exportReport = catchAsync(async (req, res) => {
  const csvData = await orderService.generateReportCSV(req.query);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=order-report.csv');
  res.status(httpStatus.OK).send(csvData);
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getVendorOrdersEvening,
  getVendorOrdersMorning,
  updateVendorOrderStatus,
  getVendorOrders,
  exportReport,
  generateReport
};
