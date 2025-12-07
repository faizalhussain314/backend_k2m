// src/services/product.service.js
const httpStatus = require('http-status');
const { Product } = require('../../models/product.model');
const { Order } = require('../../models/order.model');
const ApiError = require('../../utils/ApiError');
require('dotenv').config();
const baseUrl = process.env.BASE_URL;

// Create a new product
const createProduct = async (productBody) => {
  const product = await Product.create(productBody);
  return product;
};

// Get all products with pagination and filtering
const getProducts = async (queryParams) => {
  const page = parseInt(queryParams['page[page]']) || 1;
  const limit = parseInt(queryParams['page[limit]']) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  applyCommonFilters(queryParams, query);

  const totalResults = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limit);

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const processedProducts = processImageUrls(products);

  return {
    results: processedProducts,
    page,
    limit,
    totalPages,
    totalResults,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};






const getProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const prodObj = product.toObject();
  if (prodObj.image) {
    prodObj.image = `${baseUrl}${prodObj.image}`;
  }

  return prodObj;
};
const getProductDocById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product; // Mongoose document
};

// Update a product by ID
const updateProduct = async (productId, updateBody) => {
  const product = await getProductDocById(productId);

  Object.assign(product, updateBody);

   if (product.stock > 1) {
    product.active = true;
  } else {
    product.active = false;
  }

  await product.save();

  return product.toObject();
};

// Delete a product by ID
const deleteProduct = async (productId) => {
  // const product = await getProductDocById(productId);
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const product_exists = Order.exists({ "items.productId": productId });

  if (product_exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This product cannot be deleted as it is linked to other data.");
  }
  await product.deleteOne();
};

// Update product quick picks
const updateProductStatus = async (productId, active) => {
  const product = await getProductDocById(productId);
  product.active = active;
  await product.save();
  return product.toObject();
};
const updateQuickProductStatus = async (productId, quickPicks) => {
  const product = await getProductDocById(productId);
  
    if (quickPicks) {
    const quickPickCount = await Product.countDocuments({ quickPicks: true });
    console
    if (quickPickCount >= 8) {
      throw new Error('Cannot set quickPicks to true. Only 8 products can have quickPicks.');
    }
  }

  product.quickPicks = quickPicks;
  await product.save();
  return product.toObject();
};
const updateProductNewlyStatus = async (productId, newlyAdd) => {
  const product = await getProductDocById(productId);
    if (newlyAdd) {
    const quickPickCount = await Product.countDocuments({ newlyAdd: true });
    if (quickPickCount >= 6) {
      throw new Error('Cannot set newly Add to true. Only 6 products can have newly Add.');
    }
  }

  product.newlyAdd = newlyAdd;
  await product.save();
  return product.toObject();
};




// Get products with stock > 10
const getProductsAbove10 = async (req, res) => {
  try {
    const page = parseInt(req.query['page[page]']) || 1;
    const limit = parseInt(req.query['page[limit]']) || 10;
    const skip = (page - 1) * limit;
    
    const query = { stock: { $gt: 10 } };
    
    // Apply other filters
    applyCommonFilters(req.query, query);
    
    // Get total count and products
    const totalResults = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limit);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Process image URLs
    const processedProducts = processImageUrls(products);

    res.json({
      results: processedProducts,
      page,
      limit,
      totalPages,
      totalResults,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching products above 10:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
};

// Get products with stock <= 10
const getProductsBelow10 = async (req, res) => {
  try {
    const page = parseInt(req.query['page[page]']) || 1;
    const limit = parseInt(req.query['page[limit]']) || 10;
    const skip = (page - 1) * limit;
    
    const query = { stock: { $lte: 10 } };
    
    // Apply other filters
    applyCommonFilters(req.query, query);
    
    // Get total count and products
    const totalResults = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limit);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Process image URLs
    const processedProducts = processImageUrls(products);

    res.json({
      results: processedProducts,
      page,
      limit,
      totalPages,
      totalResults,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching products below 10:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
};

// Helper function to apply common filters
function applyCommonFilters(queryParams, query) {
  // Search
  if (queryParams['page[search]']) {
    const searchTerm = queryParams['page[search]'];
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } },
      { subcategory: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Boolean filters
  if (queryParams['page[filters][quickPicks]']) {
    query.quickPicks = queryParams['page[filters][quickPicks]'] === 'true';
  }
  
  if (queryParams['page[filters][newlyAdd]']) {
    query.newlyAdd = queryParams['page[filters][newlyAdd]'] === 'true';
  }
  
  if (queryParams['page[filters][active]']) {
    query.active = queryParams['page[filters][active]'] === 'true';
  }
  
  // Category filter
  if (queryParams['page[filters][category]']) {
    query.category = queryParams['page[filters][category]'];
  }
}

// Helper function to process image URLs
function processImageUrls(products) {
  return products.map(product => ({
    ...product,
    image: product.image ? `${process.env.BASE_URL || 'http://localhost:5000'}${product.image}` : null
  }));
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductDocById,   
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateQuickProductStatus,
  updateProductNewlyStatus,
    getProductsAbove10,
  getProductsBelow10
};
