const { User } = require('../../models/user.model');
const  Vendor = require('../../models/vendor.model');
const {Order} = require('../../models/order.model');

const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');

require('dotenv').config();
const baseUrl = process.env.BASE_URL;

const attachImageUrl = (product) => {
  if (product && product.image) {
    product.image = `${baseUrl}${product.image}`;
  }
  return product;
};

const createCustomer = async (customerData) => {
 if (!customerData.email || customerData.email.trim() === '') {
    delete customerData.email;
  }
  
  // Check if phone number already exists
  if (await User.isPhoneTaken(customerData.phoneNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already in use');
  }

  let vendor = null;
  let vendorObjectId = null;

  // If a vendorId is provided, validate and fetch the vendor
  if (customerData.vendorId) {
    vendor = await Vendor.findOne({ _id: customerData.vendorId });
    if (!vendor) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid vendorId');
    }
    vendorObjectId = vendor._id;
  }


  // Create user
  const user = await User.create({
    ...customerData,
    role: 'customer',
    isActive: true,
    vendorId: vendorObjectId,
  });

  // Optional: remove sensitive fields before returning
  const userObj = user.toObject();
  delete userObj.password;

  if (vendor) {
    userObj.vendor = vendor.toObject();
  }

  return userObj;
};


const getCustomers = async (filter) => {
  const query = { role: 'customer' };

  // Optional search filter
  if (filter.search) {
    const searchRegex = { $regex: filter.search, $options: 'i' };
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex },
      { address: searchRegex },
    ];
  }

  // Pagination setup
  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: query },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendorInfo',
      },
    },
    { $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'vendorInfo.userId',
        foreignField: '_id',
        as: 'vendorUser',
      },
    },
    { $unwind: { path: '$vendorUser', preserveNullAndEmptyArrays: true } },
    // Group customer data to avoid duplicates from $unwind
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        email: { $first: '$email' },
        phoneNumber: { $first: '$phoneNumber' },
        address: { $first: '$address' },
        vendorId: { $first: '$vendorId' },
        isVeg: { $first: '$isVeg' },
        latitude: { $first: '$latitude' },
        longitude: { $first: '$longitude' },
        isActive: { $first: '$isActive' },
        mapUrl: { $first: '$mapUrl' },
        vendorUser: { $first: '$vendorUser' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
      },
    },
    { $sort: { createdAt: 1 } }, 
    { $skip: skip },
    { $limit: limit },
  ];

  // Fetch customers and count total results
  const [customers, totalResults] = await Promise.all([
    User.aggregate(pipeline),
    User.countDocuments(query),
  ]);

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: customers,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getCustomerdata = async (filter) => {
  const customers = await User.find({ role: 'customer' });

  return {
    results: customers,
  };
};


const getCustomerById = async (customerId, filter = {}) => {
  // Parse pagination parameters
  const page = parseInt(filter.page, 10) || 1;
  const limit = parseInt(filter.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Check if customer exists
  const customer = await User.findOne({ _id: customerId, role: 'customer' });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  // Aggregation with pagination
  const result = await Order.aggregate([
    { $match: { customer: customer._id } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
  
    {
      $group: {
      _id: "$_id",
      orderId: { $first: "$orderId" },
      date: { $first: "$createdAt" },
      status: { $first: "$status" },
      amount: { $first: "$totalPrice" }
    }

    },
    { $sort: { date: -1 } },
    {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }]
      }
    }
  ]);

  const orders = result[0].paginatedResults;
  const totalResults = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    customer,
    totalOrders: totalResults,
    totalAmount: orders.reduce((sum, order) => sum + order.amount, 0),
    orders: orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      date: order.date,
      status: order.status,
      amount: order.amount
    })),
    page,
    limit,
    totalPages,
  };
};




const updateCustomer = async (customerId, updateBody) => {
  const customer = await User.findOne({ _id: customerId, role: 'customer' });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  if (updateBody.phoneNumber && (await User.isPhoneTaken(updateBody.phoneNumber, customerId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already in use');
  }
  if (updateBody.vendorId) {
    const vendor = await Vendor.findOne({ _id: updateBody.vendorId });
    if (!vendor) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid vendorId');
    }
    updateBody.vendorId = vendor._id; // Convert to ObjectId
  }


  Object.assign(customer, updateBody);
  await customer.save();
  return customer;
};

const deleteCustomer = async (customerId) => {
  const customer = await User.findOne({ _id: customerId, role: 'customer' });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  const orders = await Order.find({ customer: customerId, }).countDocuments();
    
    if (orders > 0) {
      throw new Error('Cannot delete customer because there are associated orders');
    }

  await customer.deleteOne();
};

const updateCustomerStatus = async (customerId, isActive) => {
  const customer = await User.findOne({ _id: customerId, role: 'customer' });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  customer.isActive = isActive;
  await customer.save();
  return customer;
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerdata
};













