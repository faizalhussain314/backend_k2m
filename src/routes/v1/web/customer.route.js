const express = require('express');
const validate = require('../../../middlewares/validate');
const auth = require('../../../middlewares/auth');
const customerController = require('../../../controllers/web/customer.controller');
const customerValidation = require('../../../validations/web/customer.validation');

const router = express.Router();

// Create a new customer (admin only)
router.post('/', auth('admin'), validate(customerValidation.createCustomer), customerController.createCustomer);

// Get all customers
router.get('/', auth('admin'), customerController.getCustomers);

router.get('/get-customers/data',customerController.getCustomerdata);

// Get a single customer by ID
router.get('/:customerId', auth('admin'), validate(customerValidation.getCustomer), customerController.getCustomerById);

// Update a customer (admin only)
router.put('/:customerId', auth('admin'), validate(customerValidation.updateCustomer), customerController.updateCustomer);

// Delete a customer (admin only)
router.delete('/:customerId', auth('admin'), validate(customerValidation.deleteCustomer), customerController.deleteCustomer);

// Change customer status (active/inactive)
router.patch('/:customerId/status', auth('admin'), validate(customerValidation.updateStatus), customerController.updateCustomerStatus);

module.exports = router;


/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created
 *
 *   get:
 *     summary: Get all customers
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 *
 * /customers/{customerId}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 * 
 *   put:
 *     summary: Update a customer
 *
 *   delete:
 *     summary: Delete a customer
 *
 * /customers/{customerId}/status:
 *   patch:
 *     summary: Change customer status
 */
