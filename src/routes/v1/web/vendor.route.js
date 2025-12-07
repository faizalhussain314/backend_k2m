
const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const vendorValidation = require('../../../validations/web/vendor.validation');
const vendorController = require('../../../controllers/web/vendor.controller');
const upload = require('../../../middlewares/upload'); // Import multer middleware

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor API Endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVendor:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phoneNumber
 *         - password
 *         - govtId
 *         - vendorId
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         phoneNumber:
 *           type: string
 *           example: "+1234567890"
 *         password:
 *           type: string
 *           example: "password123"
 *         govtId:
 *           type: string
 *           example: "Aadhar-1234-5678-9012"
 *         vendorId:
 *           type: string
 *           example: "VEN001"
 *
 *     UpdateVendor:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           example: jane@example.com
 *         phoneNumber:
 *           type: string
 *           example: "+1987654321"
 *         password:
 *           type: string
 *           example: "newpassword456"
 *         govtId:
 *           type: string
 *           example: "Aadhar-4321-8765-2109"
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: active
 */

/**
 * @swagger
 * /vendor:
 *   post:
 *     summary: Create a vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendor'
 *     responses:
 *       201:
 *         description: Vendor created
 */
router.post(
  '/',
  auth('admin'),
  upload.fields([
    { name: 'govtId', maxCount: 1 },
    { name: 'govtId2', maxCount: 1 }
  ]),
  vendorController.createVendor
);

  

router.get('/', auth('admin'), vendorController.getVendors);

/**
 * @swagger
 * /vendor/{vendorId}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: vendorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details
 */
router.get('/:vendorId/full', auth('vendor'), vendorController.getVendorById);
router.get('/:vendorId', auth('vendor'), vendorController.getVendorById);
router.get('/get-vendors/data',vendorController.getVendorsdata);


/**
 * @swagger
 * /vendor/{vendorId}:
 *   patch:
 *     summary: Update a vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: vendorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendor'
 *     responses:
 *       200:
 *         description: Vendor updated
 */
router.patch(
  '/:vendorId',
  auth('vendor'),
  upload.fields([
    { name: 'govtId', maxCount: 1 },
    { name: 'govtId2', maxCount: 1 }
  ]),
  vendorController.updateVendor
);

/**
 * @swagger
 * /vendor/{vendorId}:
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: vendorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor deleted
 */
router.delete('/:vendorId', auth('admin'), vendorController.deleteVendor);

/**
 * @swagger
 * /vendor/{vendorId}/status:
 *   patch:
 *     summary: Change vendor status
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: vendorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 example: active
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:vendorId/status', auth('admin'), validate(vendorValidation.changeVendorStatus), vendorController.changeVendorStatus);

module.exports = router;
