const express = require('express');
const validate = require('../../../middlewares/validate');
const adminController  = require('../../../controllers/web/admin.controller');
const auth = require('../../../middlewares/auth');
const orderController = require('../../../controllers/web/order.controller');
const orderValidation = require('../../../validations/web/order.validation');

const router = express.Router();

// Dashboard summary API
router.get('/dashboard-summary', adminController.getDashboardSummary);
router.get('/dashboard-chart', adminController.getChartsSummary);

router.get('/reports',  orderController.generateReport);
router.get('/reports/export', auth('admin'), validate(orderValidation.getReportValidation), orderController.exportReport);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-related APIs
 */

/**
 * @swagger
 * /admin/dashboard-summary:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard summary with total customers, orders, and revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCustomers:
 *                   type: integer
 *                   example: 120
 *                 totalOrders:
 *                   type: integer
 *                   example: 50
 *                 totalRevenue:
 *                   type: number
 *                   example: 1200.50
 */
