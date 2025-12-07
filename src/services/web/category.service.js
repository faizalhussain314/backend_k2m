const Category = require('../../models/category.model');
const Subcategory = require('../../models/subcategory.model');
const {Product} = require('../../models/product.model');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
require('dotenv').config();

const createCategory = async (categoryData) => {
  if (await Category.findOne({ name: categoryData.name })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already exists');
  }
  return Category.create(categoryData);
};

const getCategories = async (filter) => {
  const baseUrl = process.env.BASE_URL;
  const query = {};

  // Add search filter (e.g., by name)
  if (filter.search) {
    const searchRegex = { $regex: filter.search, $options: 'i' };
    query.name = searchRegex;
  }

  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  // Get paginated data and total count
  const [categories, totalResults] = await Promise.all([
    Category.find(query).skip(skip).limit(limit),
    Category.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  const results = categories.map((category) => {
    const catObj = category.toObject();
    if (catObj.image) {
      catObj.image = `${baseUrl}${catObj.image}`;
    }
    return catObj;
  });

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};


const getCategoryById = async (categoryId) => {
  const baseUrl = process.env.BASE_URL;
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const catObj = category.toObject();
  if (catObj.image) {
    catObj.image = `${baseUrl}${catObj.image}`;
  }

  return catObj;
};


const updateCategory = async (categoryId, updateBody) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  if (updateBody.name && (await Category.findOne({ name: updateBody.name, _id: { $ne: categoryId } }))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already exists');
  }
  Object.assign(category, updateBody);
  await category.save();
  return category;
};

const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const product_exists = await Product.exists({ category: categoryId });
  const sub_exists = await Subcategory.exists({ category: categoryId });

  if (product_exists || sub_exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This category cannot be deleted as it is linked to under Subcategory.");
  } else {
    await category.deleteOne();
  }

};

const updateCategoryStatus = async (categoryId, isActive) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  category.isActive = isActive;
  await category.save();
  return category;
};

const getDropDownCategories = async (filter) => {
  const baseUrl = process.env.BASE_URL;

  // Get paginated data and total count
  const [categories, totalResults] = await Promise.all([
    Category.find({'isActive' : true}),
  ]);

  // const results = categories.map((category) => {
  //   const catObj = category.toObject();
  //   if (catObj.image) {
  //     catObj.image = `${baseUrl}${catObj.image}`;
  //   }
  //   return catObj;
  // });

  return categories;
};


module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  getDropDownCategories,
};
