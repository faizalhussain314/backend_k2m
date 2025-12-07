const express = require('express');
const validate = require('../../../middlewares/validate');
const subcategoryValidation = require('../../../validations/web/subcategory.validation');
const subcategoryController = require('../../../controllers/web/subcategory.controller');
const upload = require('../../../middlewares/upload'); // Import multer middleware

const auth = require('../../../middlewares/auth');
const router = express.Router();

router
  .route('/')
  .post(
    auth('admin'),
    upload.single('image'), // Add multer middleware for file upload
    validate(subcategoryValidation.createSubcategory),
    subcategoryController.createSubcategory
  )
  .get(subcategoryController.getAllSubcategories);

router.route('/:subcategoryId/dropdown').get(validate(subcategoryValidation.getSubcategory), subcategoryController.getSubcategoryDropdown);
router.route('/:categoryId').get(validate(subcategoryValidation.getcategory), subcategoryController.getcategory);


router
  .route('/:subcategoryId')
  .get(validate(subcategoryValidation.getSubcategory), subcategoryController.getSubcategory)
  .patch(
    auth('admin'),
    upload.single('image'), // Handle image update
    validate(subcategoryValidation.updateSubcategory),
    subcategoryController.updateSubcategory
  )
  .delete(auth('admin'), validate(subcategoryValidation.deleteSubcategory), subcategoryController.deleteSubcategory);
  router.patch(
    '/:subcategoryId/status',
    auth('admin'),
    validate(subcategoryValidation.updateStatus),
    subcategoryController.updateSubcategoryStatus
  );
  
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Subcategory
 *   description: Subcategory management operations
 */

/**
 * @swagger
 * /subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     tags: [Subcategory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:  # ✅ Supports image upload
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               category:
 *                 type: string
 *                 example: "vegtable"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /subcategories:
 *   get:
 *     summary: Get all subcategories
 *     tags: [Subcategory]
 *     responses:
 *       200:
 *         description: Successfully retrieved subcategories
 */

/**
 * @swagger
 * /subcategories/{subcategoryId}:
 *   get:
 *     summary: Get subcategory by ID
 *     tags: [Subcategory]
 *     parameters:
 *       - name: subcategoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved subcategory
 *       404:
 *         description: Subcategory not found
 */

/**
 * @swagger
 * /subcategories/{subcategoryId}:
 *   patch:
 *     summary: Update a subcategory
 *     tags: [Subcategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subcategoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:  # ✅ Supports image update
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptops"
 *               category:
 *                 type: string
 *                 example: "vegtable"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Subcategory not found
 */

/**
 * @swagger
 * /subcategories/{subcategoryId}:
 *   delete:
 *     summary: Delete a subcategory
 *     tags: [Subcategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subcategoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
 *       404:
 *         description: Subcategory not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subcategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60a7af5b2f8fb814b56fa189"
 *         name:
 *           type: string
 *           example: "Gaming Laptops"
 *         category:
 *           type: string
 *           example: "vegtable"
 *         image:
 *           type: string
 *           example: "/uploads/1743529911764-subcategory.jpg"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /subcategories/{subcategoryId}/status:
 *   patch:
 *     summary: Change subcategory status (Active/Inactive)
 *     tags: [Subcategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subcategoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "660a7af5b2f8fb814b56fa189"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Subcategory status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Subcategory not found
 */
