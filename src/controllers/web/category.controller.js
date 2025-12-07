const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const categoryService = require('../../services/web/category.service');

const createCategory = catchAsync(async (req, res) => {
  const categoryData = {
    name: req.body.name,
    image: req.file ? `/uploads/${req.file.filename}` : null, // Store image path
    isActive: req.body.isActive ?? true,
  };
  const category = await categoryService.createCategory(categoryData);
  res.status(httpStatus.CREATED).send(category);
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getCategories(req.query);
  res.status(httpStatus.OK).send(categories);
});

const getCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.query,req.params.categoryId);
  res.status(httpStatus.OK).send(category);
});

const updateCategory = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.image = `/uploads/${req.file.filename}`; 
  }
  const category = await categoryService.updateCategory(req.params.categoryId, req.body);
  res.status(httpStatus.OK).send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateCategoryStatus = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategoryStatus(req.params.categoryId, req.body.isActive);
  res.status(httpStatus.OK).send(category);
});

const getDropDownCategories = catchAsync(async (req, res) => {    
  const categories = await categoryService.getDropDownCategories(req.query);
  res.status(httpStatus.OK).send(categories);
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  getDropDownCategories,
};
