const express = require('express');
const router = express.Router();
const { customerController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const subcategoryValidation = require('../../validations/web/subcategory.validation');
const subcategoryController = require('../../controllers/web/subcategory.controller');
const { customerValidation } = require('../../validations');
const auth = require('../../middlewares/auth');

// Customer profile management
router.get('/profile', auth('customer'), customerController.getProfile);
router.patch('/profile', auth('customer'), validate(customerValidation.updateProfile), customerController.updateProfile);

// Customer addresses
router.post('/addresses', auth('customer'), validate(customerValidation.addAddress), customerController.addAddress);
router.get('/addresses', auth('customer'), customerController.getAddresses);
router.delete('/addresses/:addressId', auth('customer'), validate(customerValidation.deleteAddress), customerController.deleteAddress);

router.get('/products',  customerController.getProducts);
router.get('/quick-picks', auth('customer'), customerController.getQuickProducts);
router.get('/newly-added', auth('customer'), customerController.getNewlyProducts);

router.get('/best-selling', auth('customer'), customerController.getProducts);
router.post('/get-vendor',validate(customerValidation.getVendor), customerController.getVendor);

router.post('/cart', auth('customer'), validate(customerValidation.addToCart), customerController.addToCart);
router.get('/cart', auth('customer'), customerController.getCart); // Get cart items
router.delete('/cart/:cartItemId', auth('customer'), customerController.removeFromCart); // Remove from cart

// Order management
router.post('/orders', auth('customer'), validate(customerValidation.placeOrder), customerController.placeOrder);
router.get('/orders', auth('customer'), customerController.getOrders); // Get all orders
router.get('/orders/:orderId', auth('customer'), customerController.getOrderDetails); // Get order details
router.patch('/orders/:orderId/cancel', auth('customer'), validate(customerValidation.cancelOrder), customerController.cancelOrder);
router.get('/orders/:orderId/track', auth('customer'), customerController.trackOrder); // Track order status

router.get('/subcategory/:subcategoryId', auth('customer'),validate(subcategoryValidation.getSubcategory), subcategoryController.getSubcategoryByProducts); // Track order status


module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer operations
 */

/**
 * @swagger
 * /customer/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */

/**
 * @swagger
 * /customer/profile:
 *   patch:
 *     summary: Update profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Address added
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/addresses:
 *   get:
 *     summary: Get all customer addresses
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: ID of the address to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */

/**
 * @swagger
 * /customer/products:
 *   get:
 *     summary: Browse products
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [vegetables, fruits, dairy]
 *         description: Category of products to filter by
 *     responses:
 *       200:
 *         description: Product list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/cart:
 *   post:
 *     summary: Add an item to the customer's cart
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []  # Using bearer authentication (JWT)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'  # Referring to CartItem schema
 *     responses:
 *       201:
 *         description: Item successfully added to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'  # Returning the cart item object
 *       400:
 *         description: Invalid input, such as missing or invalid product ID or quantity
 *       401:
 *         description: Unauthorized, invalid or missing authentication token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: ID of the product to add to the cart
 *           example: "60d2c45f6b2a07335e27c05c"
 *         quantity:
 *           type: integer
 *           description: Quantity of the product to be added to the cart
 *           example: 2
 *       required:
 *         - productId
 *         - quantity
 */

/**
 * @swagger
 * /customer/cart:
 *   get:
 *     summary: Get all items in the cart
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/cart/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         description: ID of the cart item to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: ID of the product
 *           example: '67f159a9904b1efd70b43eda'
 *         quantity:
 *           type: integer
 *           description: Quantity of the product
 *           example: 2
 *     OrderRequest:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           description: List of items in the order
 *     OrderResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: 'Order placed successfully'
 *         orderId:
 *           type: string
 *           example: '67f53ef9654686787c0506e2'
 * 
 * paths:
 *   /customer/orders:
 *     post:
 *       summary: Place an order
 *       description: This endpoint allows a customer to place an order.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderRequest'
 *       responses:
 *         '201':
 *           description: Order placed successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/OrderResponse'
 *         '400':
 *           description: Bad request - validation error or invalid data
 *         '500':
 *           description: Internal server error
 */

/**
 * @swagger
 * /customer/orders:
 *   get:
 *     summary: Get all customer orders
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /customer/orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to cancel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/orders/{orderId}/track:
 *   get:
 *     summary: Track an order
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to track
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order tracking information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderTracking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
