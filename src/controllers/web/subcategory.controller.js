const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { subcategoryService } = require('../../services');

const createSubcategory = catchAsync(async (req, res) => {
    const subcategoryData = req.body;
        if (req.file) {
      subcategoryData.image = `/uploads/${req.file.filename}`;
    }
    const subcategory = await subcategoryService.createSubcategory(subcategoryData);
    res.status(httpStatus.CREATED).send(subcategory);
  });
  

const getSubcategory = catchAsync(async (req, res) => {
  const subcategory = await subcategoryService.getSubcategoryById(req.params.subcategoryId);
  if (!subcategory) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Subcategory not found' });
  }
  res.send(subcategory);
});
const getcategory = catchAsync(async (req, res) => {
  const subcategory = await subcategoryService.getcategoryById(req.query,req.params.categoryId);
  if (!subcategory) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Subcategory not found' });
  }
  res.send(subcategory);
});

const getSubcategoryDropdown = catchAsync(async (req, res) => {
  const subcategory = await subcategoryService.getSubcategoryDropdown(req.params.subcategoryId);
  if (!subcategory) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Subcategory not found' });
  }
  res.send(subcategory);
});



const getAllSubcategories = catchAsync(async (req, res) => {
  const subcategories = await subcategoryService.getAllSubcategories(req.query);
  res.send(subcategories);
});

const updateSubcategory = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.image = `/uploads/${req.file.filename}`; 
  }
  const subcategory = await subcategoryService.updateSubcategory(req.params.subcategoryId, req.body);
  res.send(subcategory);
});

const deleteSubcategory = catchAsync(async (req, res) => {
  await subcategoryService.deleteSubcategory(req.params.subcategoryId);
  res.status(httpStatus.NO_CONTENT).send();
});
const updateSubcategoryStatus = catchAsync(async (req, res) => {
    const { subcategoryId } = req.params;
    const { isActive } = req.body;
  
    const updatedSubcategory = await subcategoryService.updateSubcategoryStatus(subcategoryId, isActive);
    res.status(httpStatus.OK).send(updatedSubcategory);
  });
  
  const getSubcategoryByProducts = catchAsync(async (req, res) => {
    const subcategory = await subcategoryService.getSubcategoryByProducts(req.params.subcategoryId,req.query);
    if (!subcategory) {
      return res.status(httpStatus.NOT_FOUND).send({ message: 'Subcategory not found' });
    }
    res.send(subcategory);
  });
  
module.exports = {
  createSubcategory,
  getSubcategory,
  getAllSubcategories,
  updateSubcategory,
  deleteSubcategory,
  updateSubcategoryStatus,
  getSubcategoryByProducts,
  getSubcategoryDropdown,
  getcategory
};
