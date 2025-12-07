const { User } = require('../../models/user.model');
const Vendor = require('../../models/vendor.model');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const {Order} = require('../../models/order.model');

require('dotenv').config();
const baseUrl = process.env.BASE_URL;

const createVendor = async (vendorData) => {
   if (vendorData.email === "") {
    vendorData.email = null;
  }
 const existingPhoneNumber = await User.findOne({ phoneNumber: vendorData.phoneNumber });
  if (existingPhoneNumber) {
   throw new ApiError(httpStatus.NOT_FOUND, 'Phone number already exists');
  }

  const existingEmail = await User.findOne({ email: vendorData.email });
  if (existingEmail) {
  throw new ApiError(httpStatus.NOT_FOUND, 'Email already exists.');

  }
  const existingVendorCode = await Vendor.findOne({ vendorCode: vendorData.vendorCode });
  if (existingVendorCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor code already exists');
  }
  const user = new User({ ...vendorData, role: 'vendor' });
  await user.save();
  const vendor = new Vendor({
    userId: user._id,
    govtId: vendorData.govtId,
    govtId2: vendorData.govtId2,
    vendorCode: vendorData.vendorCode,
    serviceLocations: vendorData.serviceLocations,
  });
  await vendor.save();

  user.vendorId = vendor._id;
  await user.save();

  return vendor;
};

const updateVendor = async (vendorId, updateBody) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  const user = await User.findById(vendor.userId);
  if (!user) {
    throw new Error('Associated user not found');
  }
  if (updateBody.phoneNumber && (await User.isPhoneTaken(updateBody.phoneNumber, user._id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already in use');
  }
  // Update User fields
  const userFields = ['name', 'email', 'phoneNumber', 'address', 'longitude', 'latitude'];
  userFields.forEach((field) => {
    if (updateBody[field] !== undefined) {
      user[field] = updateBody[field];
    }
  });



  await user.save();


  // Update Vendor fields
  if (updateBody.govtId !== undefined) {
    vendor.govtId = updateBody.govtId;
  }
  if (updateBody.govtId2 !== undefined) {
    vendor.govtId2 = updateBody.govtId2;
  }

  if (updateBody.serviceLocations !== undefined) {
    vendor.serviceLocations = updateBody.serviceLocations;
  }

  await vendor.save();


  return vendor
};

const deleteVendor = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new Error('Vendor not found');
  }
   const customers = await User.find({ vendorId: vendor._id, role: 'customer' }).countDocuments();
  
  if (customers > 0) {
    throw new Error('Cannot delete vendor because there are associated customers');
  }

  await User.findByIdAndDelete(vendor.userId);
  await vendor.deleteOne();
  return vendor;
};

const getVendorById = async (vendorId, userFilter = {}, orderFilter = {}, type = 'both') => {
  // Get vendor data
  const vendor = await Vendor.findById(vendorId).populate('userId');
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  if (vendor.govtId) {
    vendor.govtId = `${baseUrl}${vendor.govtId}`;
  }
 if (vendor.govtId2) {
    vendor.govtId2 = `${baseUrl}${vendor.govtId2}`;
  }
  // --- USERS SECTION ---
  let userPage = parseInt(userFilter.page, 10) || 1;
  let userLimit = parseInt(userFilter.limit, 10) || 10;
  const userSkip = (userPage - 1) * userLimit;

  let usersData = {};
  let userTotalPages = 0;
  if (type === 'users' || type === 'both') {
    // Get users with total spend using aggregation
    const usersAggregation = await User.aggregate([
      { $match: { vendorId: vendor._id, role: 'customer' } },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          paginatedResults: [
            { $skip: userSkip },
            { $limit: userLimit },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phoneNumber: 1,
                address: 1
              }
            },
            // Lookup to get total spend from orders
            {
              $lookup: {
                from: 'orders',
                let: { userId: '$_id' },
                pipeline: [
                  { 
                    $match: { 
                      $expr: { $eq: ['$customer', '$$userId'] } 
                    } 
                  },
                  {
                    $group: {
                      _id: null,
                      totalSpend: { $sum: '$totalPrice' }
                    }
                  }
                ],
                as: 'spendData'
              }
            },
            // Add totalSpend field with default 0
            {
              $addFields: {
                totalSpend: {
                  $cond: {
                    if: { $gt: [{ $size: '$spendData' }, 0] },
                    then: { $arrayElemAt: ['$spendData.totalSpend', 0] },
                    else: 0
                  }
                }
              }
            },
            // Remove the spendData array
            {
              $project: {
                spendData: 0
              }
            }
          ]
        }
      }
    ]);

    const totalUsers = usersAggregation[0].totalCount[0]?.count || 0;
    const enrichedUsers = usersAggregation[0].paginatedResults;
    userTotalPages = Math.ceil(totalUsers / userLimit);

    usersData = {
      results: enrichedUsers,
      page: userPage,
      limit: userLimit,
      totalPages: userTotalPages,
      totalResults: totalUsers,
    };
  }

  // --- ORDERS SECTION ---
  let orderPage = parseInt(orderFilter.page, 10) || 1;
  let orderLimit = parseInt(orderFilter.limit, 10) || 10;
  const orderSkip = (orderPage - 1) * orderLimit;

  let ordersData = {};
  let orderTotalPages = 0;
  let ordersTotalRevenue = 0;
  if (type === 'orders' || type === 'both') {
    // Get all customer IDs for this vendor (for order filtering)
    const customerIdsQuery = await User.aggregate([
      { $match: { vendorId: vendor._id, role: 'customer' } },
      { $project: { _id: 1 } }
    ]);
    const customerIds = customerIdsQuery.map(doc => doc._id);

    // Get orders and related data using aggregation
    const ordersAggregation = await Order.aggregate([
      { $match: { customer: { $in: customerIds } } },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          totalRevenue: [
            {
              $group: {
                _id: null,
                total: { $sum: '$totalPrice' }
              }
            }
          ],
          paginatedResults: [
            { $sort: { createdAt: -1 } },
            { $skip: orderSkip },
            { $limit: orderLimit },
            {
              $project: {
                _id: 1,
                orderId: 1,
                createdAt: 1,
                status: 1,
                totalPrice: 1,
                items: 1,
                customer: 1
              }
            },
            // Lookup to get customer name
            {
              $lookup: {
                from: 'users',
                localField: 'customer',
                foreignField: '_id',
                pipeline: [{ $project: { name: 1 } }],
                as: 'customerData'
              }
            },
            // Format the order data
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: '%d-%b-%Y',
                    date: '$createdAt'
                  }
                },
                itemsCount: { $size: '$items' },
                customerName: {
                  $cond: {
                    if: { $gt: [{ $size: '$customerData' }, 0] },
                    then: { $arrayElemAt: ['$customerData.name', 0] },
                    else: 'Unknown'
                  }
                }
              }
            },
            // Clean up response
            {
              $project: {
                _id: 1,
                orderId: 1,
                date: 1,
                status: 1,
                totalPrice: 1,
                itemsCount: 1,
                customerName: 1
              }
            }
          ]
        }
      }
    ]);
    const totalOrders = ordersAggregation[0].totalCount[0]?.count || 0;
    const totalRevenueAmount = ordersAggregation[0].totalRevenue[0]?.total || 0;
    const formattedOrders = ordersAggregation[0].paginatedResults;
    orderTotalPages = Math.ceil(totalOrders / orderLimit);
    ordersTotalRevenue = totalRevenueAmount;
    ordersData = {
      results: formattedOrders,
      page: orderPage,
      limit: orderLimit,
      totalPages: orderTotalPages,
      totalResults: totalOrders,
    };
  }

  return {
    vendor,
    totalOrders: ordersData.totalResults || 0,
    totalUsers: usersData.totalResults || 0,
    totalRevenue: ordersTotalRevenue || 0,
    users: usersData,
    orders: ordersData
  };
};


// const getVendorById = async (vendorId) => {
//   const vendor = await Vendor.findById(vendorId).populate('userId');
//   if (vendor && vendor.govtId) {
//     vendor.govtId = `${baseUrl}${vendor.govtId}`;
//   }
//   return vendor;
// };

const getVendors = async (filter) => {
  const searchRegex = filter.search ? { $regex: filter.search, $options: 'i' } : null;

  const orConditions = [];

  // Vendor fields
  if (searchRegex) {
    orConditions.push({ vendorCode: searchRegex });
    orConditions.push({ serviceLocations: searchRegex });
  }

  const page = parseInt(filter.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // First: Lookup and Match Pipeline (used in both count and data)
  const basePipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
  ];

  // Add search filter
  if (searchRegex) {
    orConditions.push({ 'user.name': searchRegex });
    orConditions.push({ 'user.phoneNumber': searchRegex });
    basePipeline.push({ $match: { $or: orConditions } });
  }

  // Second: Count total results (just like your original pipeline)
  const countPipeline = [...basePipeline, { $count: 'total' }];
  const countResult = await Vendor.aggregate(countPipeline);
  const totalResults = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalResults / limit);

  // Third: Fetch paginated data with customer count and order count
  const dataPipeline = [
    ...basePipeline,
    { $skip: skip },
    { $limit: limit },
    {
      $addFields: {
        govtId: {
          $cond: {
            if: { $ifNull: ['$govtId', false] },
            then: { $concat: [baseUrl, '$govtId'] },
            else: '$govtId',
          },
        },
      },
    },
     {
      $addFields: {
        govtId2: {
          $cond: {
            if: { $ifNull: ['$govtId2', false] },
            then: { $concat: [baseUrl, '$govtId2'] },
            else: '$govtId2',
          },
        },
      },
    },
    // Add customer count by performing a lookup with the 'users' collection
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'vendorId', // Assuming 'vendorId' is in the 'users' collection
        as: 'customers',
        pipeline: [
          { $match: { role: 'customer' } }, // Only consider users with role 'customer'
        ],
      },
    },
    {
      $addFields: {
        customerCount: { $size: '$customers' }, // Count the number of customers for each vendor
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'vendor', // Assuming 'vendorId' is in the 'orders' collection
        as: 'orders',
      },
    },
    {
      $addFields: {
        orderCount: { $size: '$orders' }, // Count the number of orders for each vendor
      },
    },
    // Optionally, remove the 'customers' and 'orders' arrays to clean up the response
    {
      $project: {
        customers: 0,
        orders: 0,
      },
    },
  ];

  const vendors = await Vendor.aggregate(dataPipeline);

  return {
    results: vendors,
    page,
    limit,
    totalPages,
    totalResults,
  };
};



const changeStatus = async (vendorId, status) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  vendor.status = status;
  await vendor.save();
  return vendor;
};

const getVendorsdata = async (filter) => {
  

  // First: Lookup and Match Pipeline (used in both count and data)
  const basePipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
  ];

  const vendors = await Vendor.aggregate(basePipeline);

  return {
    results: vendors,
  };
};


module.exports = {
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorById,
  getVendors,
  changeStatus,
  getVendorsdata
};
