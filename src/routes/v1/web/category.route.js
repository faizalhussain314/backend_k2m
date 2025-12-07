const express = require('express');
const validate = require('../../../middlewares/validate');
const auth = require('../../../middlewares/auth');
const categoryController = require('../../../controllers/web/category.controller');
const categoryValidation = require('../../../validations/web/category.validation');
const upload = require('../../../middlewares/upload'); // Import multer middleware

const router = express.Router();

// Create a new category (admin only)
router.post(
    '/',
    auth('admin'),
    upload.single('image'), // Handle single file upload
    validate(categoryValidation.createCategory),
    categoryController.createCategory
  );

// Get all categories
router.get('/', categoryController.getCategories);

// Get all categories
router.get('/dropdown', categoryController.getDropDownCategories);

// Get a single category by ID
router.get('/:categoryId', validate(categoryValidation.getCategory), categoryController.getCategoryById);

// Update a category (admin only)
router.put('/:categoryId', auth('admin'), upload.single('image'), validate(categoryValidation.updateCategory), categoryController.updateCategory);

// Delete a category (admin only)
router.delete('/:categoryId', auth('admin'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

// Change category status (active/inactive)
router.patch('/:categoryId/status', auth('admin'), validate(categoryValidation.updateStatus), categoryController.updateCategoryStatus);



module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management operations
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     description: Allows admin to create a new category with a name and optional image upload.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category
 *                 example: "Electronics"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request (validation failed)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all categories.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 */

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve category details using its ID.
 *     tags: [Categories]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "660a7af5b2f8fb814b56fa189"
 *     responses:
 *       200:
 *         description: Successfully retrieved category
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/{categoryId}:
 *   put:
 *     summary: Update a category
 *     description: Allows admin to update category name and/or image.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "660a7af5b2f8fb814b56fa189"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the category
 *                 example: "Laptops"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file (optional)
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     description: Permanently deletes a category by ID. Admin access required.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "660a7af5b2f8fb814b56fa189"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/{categoryId}/status:
 *   patch:
 *     summary: Change category status (Active/Inactive)
 *     description: Enables or disables a category based on `isActive` flag.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
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
 *                 description: Status to set (true = active, false = inactive)
 *                 example: true
 *     responses:
 *       200:
 *         description: Category status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "60a7af5b2f8fb814b56fa189"
 *         name:
 *           type: string
 *           description: Name of the category
 *           example: "Gaming Laptops"
 *         image:
 *           type: string
 *           description: Image URL or path
 *           example: "/uploads/1743529911764-categories.jpg"
 *         isActive:
 *           type: boolean
 *           description: Status of the category
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
