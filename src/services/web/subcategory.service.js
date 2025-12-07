const Subcategory = require('../../models/subcategory.model');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const { Product } = require('../../models/product.model');
require('dotenv').config();
const baseUrl = process.env.BASE_URL;
const mongoose = require('mongoose');

const createSubcategory = async (subcategoryData) => {
  if (await Subcategory.findOne({ name: subcategoryData.name })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Subcategory name already exists');
  }
  return Subcategory.create(subcategoryData);
};

const getSubcategoryById = async (id) => {
  const subcategory = await Subcategory.findById(id).populate('category');

  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }

  const subObj = subcategory.toObject();
  if (subObj.image) {
    subObj.image = `${baseUrl}${subObj.image}`;
  }

  return subObj;
};

const getSubcategoryDropdown = async (id) => {

  const subcategory = await Subcategory.find({ category: id });

  if (!subcategory || subcategory.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }


  return subcategory;
};
const getAllSubcategories = async (filter) => {
  const baseUrl = process.env.BASE_URL;
  
  // Convert string parameters to numbers
  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query object
  const query = {};

  // Search filter (search in subcategory name and category name)
  if (filter.search && filter.search.trim() !== '') {
    const searchRegex = { $regex: filter.search.trim(), $options: 'i' };
    
    // Use aggregation pipeline for searching in populated category name
    const aggregationPipeline = [
      // Lookup/join with category collection
      {
        $lookup: {
          from: 'categories', // Assuming your categories collection is named 'categories'
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      // Match stage for search
      {
        $match: {
          $or: [
            { name: searchRegex },
            { 'categoryInfo.name': searchRegex }
          ]
        }
      },
      // Add fields to restructure the document
      {
        $addFields: {
          category: '$categoryInfo'
        }
      },
      // Remove the temporary categoryInfo field
      {
        $project: {
          categoryInfo: 0
        }
      },
      // Sort by name
      {
        $sort: { name: 1 }
      }
    ];

    // Get total count with search
    const totalCountPipeline = [...aggregationPipeline, { $count: "total" }];
    const totalCountResult = await Subcategory.aggregate(totalCountPipeline);
    const totalResults = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

    // Get paginated results
    const subcategories = await Subcategory.aggregate([
      ...aggregationPipeline,
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    // Transform results to include full image URLs
    const results = subcategories.map((subcat) => {
      if (subcat.image) {
        subcat.image = `${baseUrl}${subcat.image}`;
      }
      return subcat;
    });

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } else {
    // Original logic for when there's no search term
    const [subcategories, totalResults] = await Promise.all([
      Subcategory.find(query)
        .populate('category')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Subcategory.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    const results = subcategories.map((subcat) => {
      const subObj = subcat.toObject();
      if (subObj.image) {
        subObj.image = `${baseUrl}${subObj.image}`;
      }
      return subObj;
    });

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  }
};

const getcategoryById = async (filter,categoryId) => {
  const baseUrl = process.env.BASE_URL;
  const query = {};

  // ✅ Filter by categoryId if provided
  if (categoryId) {
    query.category = categoryId;
  }

  // Optional search filter on subcategory name
  if (filter.search) {
    query.name = { $regex: filter.search, $options: 'i' };
  }

  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  const [subcategories, totalResults] = await Promise.all([
    Subcategory.find(query).populate('category').skip(skip).limit(limit),
    Subcategory.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  const results = subcategories.map((subcat) => {
    const subObj = subcat.toObject();
    if (subObj.image) {
      subObj.image = `${baseUrl}${subObj.image}`;
    }
    return subObj;
  });

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};


const updateSubcategory = async (id, updateData) => {
  const subcategory = await Subcategory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }
  return subcategory;
};

const deleteSubcategory = async (id) => {
  const subcategory = await Subcategory.findById(id);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }

  const product_exists = await Product.exists({ subcategory: subcategory.name });

  if (product_exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This sub category cannot be deleted as it is linked to under products.");
  } else {
    await subcategory.deleteOne();
  }
};
const updateSubcategoryStatus = async (subcategoryId, isActive) => {
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
    }
  
    subcategory.isActive = isActive;
    await subcategory.save();
    return subcategory;
  };
  
const getSubcategoryByProducts = async (id, filter) => {
  // Find the subcategory by ID
  const subcategory = await Subcategory.findById(id);

  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
  }

  // Pagination and filter setup
  const page = parseInt(filter.page, 10) || 1;
  const limit = parseInt(filter.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build the query
  const query = {
    subcategory: subcategory.name,
  };

  if (filter.search) {
    const searchRegex = { $regex: filter.search, $options: 'i' };
    query.name = searchRegex; // assuming you want to filter product names
  }

  // Fetch total count before pagination
  const totalResults = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limit);

  // Fetch paginated products
  const products = await Product.find(query).skip(skip).limit(limit);

  // Modify image URLs
  const updatedProducts = products.map((product) => {
    const prod = product.toObject();
    if (prod.image) {
      prod.image = `${baseUrl}${prod.image}`;
    }
    return prod;
  });

  // Return paginated response
  return {
    results: updatedProducts,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

  
module.exports = {
  createSubcategory,
  getSubcategoryById,
  getAllSubcategories,
  updateSubcategory,
  deleteSubcategory,
  updateSubcategoryStatus,
  getSubcategoryByProducts,
  getSubcategoryDropdown,
  getcategoryById 
};
