// routes/vendor.route.js


const express = require('express');
const router = express.Router();
const { customerController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const vendorValidation = require('../../validations/vendor.validation');
const vendorController = require('../../controllers/vendor.controller');
const auth = require('../../middlewares/auth');

// Profile
router.get('/profile', auth('vendor'), vendorController.getProfile);
router.patch('/profile', auth('vendor'), validate(vendorValidation.updateProfile), vendorController.updateProfile);


// Order stats
router.get('/order-stats', auth('vendor'), vendorController.getOrderStats);

// Weekly report
router.get('/weekly-report', auth('vendor'), vendorController.getWeeklyOrdersCount);

// Weekly report

// Deliveries
router.get('/deliveries', auth('vendor'), vendorController.getDeliveries);
router.get('/customer/:customerId', auth('vendor'), validate(vendorValidation.getCustomer), vendorController.getCustomerById);
router.post('/reset/:customerId', auth('vendor'), validate(vendorValidation.getCustomer), vendorController.resetCustomer);


// Orders
router.get('/orders',auth('vendor'), vendorController.getVendorOrdersMorning);
router.get('/orders/:orderId', auth('vendor'), validate(vendorValidation.getOrder), vendorController.getOrderById);
// router.get('/orders',auth('vendor'), vendorController.getVendorOrdersMorning);

// Create customer
router.post('/create-customer', auth('vendor'), validate(vendorValidation.createCustomer), vendorController.createCustomer);



router.get('/:vendorId', auth('vendor'), vendorController.getVendorById);

module.exports = router;
