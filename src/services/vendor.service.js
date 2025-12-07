const { User } = require('../models/user.model');
const { Order } = require('../models/order.model');
const Vendor = require('../models/vendor.model');

const moment = require('moment');


require('dotenv').config();
const baseUrl = process.env.BASE_URL;

const attachImageUrl = (product) => {
  if (product && product.image) {
    product.image = `${baseUrl}${product.image}`;
  }
  return product;
};

exports.getProfile = async (vendorId) => {
  return User.findById(vendorId);
};

exports.updateProfile = async (vendorId, updateBody) => {
  return User.findByIdAndUpdate(vendorId, updateBody, { new: true });
};

exports.getOrderStats = async (userId) => {

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // ✅ Step 1: Find the vendor using userId (NOT findById)
  const vendor = await Vendor.findOne({ userId });

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  const vendorId = vendor._id;

  // ✅ Step 2: Fetch orders by vendor's user ID (used in Order.vendor)
  const orders = await Order.find({
    vendor: vendorId, // order.vendor = user's ID
  createdAt: { $gte: startOfToday, $lte: endOfToday },
  });

  const totalOrders = orders.length;
  const readyToDeliver = orders.filter((o) => o.status === 'ready').length;
  const pendingDelivery = orders.filter((o) => o.status === 'dispatch').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;

  // ✅ Step 3: Count all customers tied to this vendor (User.vendorId = vendor._id)
  const uniqueCustomers = await User.countDocuments({
    role: 'customer',
    vendorId: vendorId,
  });

  // ✅ Step 4: Customers who placed orders today
  const todayOrders = orders.filter(
    (o) => o.createdAt >= startOfToday && o.createdAt <= endOfToday
  );
  const totalCustomersToday = new Set(
    todayOrders.map((o) => o.customer.toString())
  ).size;

  return {
    totalOrders,
    readyToDeliver,
    pendingDelivery,
    completedOrders,
    uniqueCustomers,
    totalCustomersToday,
  };
};

exports.getWeeklyReport = async (vendorId) => {
  const oneWeekAgo = moment().subtract(6, 'days').startOf('day');

  const orders = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        createdAt: { $gte: oneWeekAgo.toDate() },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalPrice' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return orders;
};

exports.getDeliveries = async (vendorId) => {
  return Order.find({ vendor: vendorId, status: 'dispatch' }).populate('customer');
};

exports.getOrders = async (vendorId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  return Order.find({ vendor: vendorId })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
};

exports.getOrderDetail = async (vendorId, orderId) => {
  return Order.findOne({ _id: orderId, vendor: vendorId }).populate('customer items.productId');
};

exports.createCustomer = async (vendorId, data) => {
  const newUser = new User({
    ...data,
    role: 'customer',
    vendorId,
  });
  await newUser.save();
  return newUser;
};


exports.getCustomerById = async (customerId, filter = {}) => {
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
     {
      $addFields: {
        totalItems: { $size: "$items" }  // Count items array length per order
      }
    },
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
        orderId: { $first: "$orderId" },  // assuming this exists
        date: { $first: "$createdAt" },
        status: { $first: "$status" },
        amount: { $first: "$totalPrice" },
        totalItems: { $first: "$totalItems" }  // Take the count from added field

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
      amount: order.amount,
      totalItems: order.totalItems, 
    })),
    page,
    limit,
    totalPages,
  };
};


exports.getOrderById = async (orderId) => {
  const order = await Order.findById(orderId).populate('customer items.productId');
  
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  order.items = order.items.map(item => {
    if (item.productId) {
      attachImageUrl(item.productId);
    }
    return item;
  });

  return order;
};


exports.getVendorOrdersMorning = async (vendorId, filter) => {
  const baseUrl = process.env.BASE_URL;

  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  query.vendor = vendorId;
  


  // Filter by customer if not admin
  // if (user.role !== 'admin') {
  //   query.customer = user.id;
  // }

  // Search

  if (filter.search) {
    const searchRegex =  filter.search; // string like 'sdfsdfd'
    query.$or = [
      { orderId: { $regex: searchRegex, $options: 'i' } },
      { 'customer.name': { $regex: searchRegex, $options: 'i' } },
      { 'vendor.name': { $regex: searchRegex, $options: 'i' } }
    ];
  }
  
  // Filter by status
  if (filter.status) {
    query.status = filter.status;
  }

  // Filter by date
  // if (filter.dateFrom || filter.dateTo) {
  //   const dateRange = {};
  //   if (filter.dateFrom) dateRange.$gte = new Date(filter.dateFrom);
  //   if (filter.dateTo) dateRange.$lte = new Date(filter.dateTo);
  //   query.createdAt = dateRange;
  // }
  query.batch = 'Morning';

  // Get orders and total count
  const [orders, totalResults] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer items.productId'), // vendor will be manually resolved
    Order.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  // Resolve vendor details from Vendor + User
const ordersWithVendorInfo = await Promise.all(orders.map(async (order) => {
  const orderObj = order.toObject();

  // Populate product image & add product name and quantity
orderObj.items = orderObj.items.map(item => {
  const product = item.productId;
  if (product?.image) {
    product.image = `${baseUrl}${product.image}`;
  }

  return {
    ...item, // preserve productId and quantity
    productId: product, // full product details
  };
});


  // Populate vendor info
  if (orderObj.vendor) {
    const vendorDoc = await Vendor.findById(orderObj.vendor).populate('userId');
    if (vendorDoc && vendorDoc.userId) {
      orderObj.vendor = {
        _id: vendorDoc._id,
        name: vendorDoc.userId.name,
      };
    }
  }
  return {
    _id: orderObj._id,
    orderId: orderObj.orderId,
    customer: {
      _id: orderObj.customer?._id,
      name: orderObj.customer?.name || '',
      phone: orderObj.customer?.phoneNumber || '',
      address: orderObj.customer?.address || '',
      latitude: orderObj.customer?.latitude || null,
      longitude: orderObj.customer?.longitude || null,
    },
    vendor: {
      _id: orderObj.vendor?._id || null,
      name: orderObj.vendor?.name || '',
    },
    items: orderObj.items, // add full item info here
    date: new Date(orderObj.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }), // e.g. "13 May 2025"
    time: new Date(orderObj.createdAt).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }), // e.g. "14:30"
    status: orderObj.status,
    batch: orderObj.batch,
   totalPrice: orderObj.items.reduce((total, item) => {
  const product = item.productId;
  if (!product) return total;

  if (product.unit === 'kg') {
    const quantityInKg = item.quantity / 1000;
    return total + (product.price * quantityInKg);
  } else if (product.unit === 'piece') {
    return total + (product.price * item.quantity); // No conversion
  } else {
    throw new Error(`Unknown unit type for product ${product.name}`);
  }
}, 0).toFixed(2),




  };
}));

  return {
    results: ordersWithVendorInfo,
    page,
    limit,
    totalPages,
    totalResults,
  };
};


exports.getVendorUsersOnly = async (vendorId, userFilter = {}) => {
  // Get vendor data
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  const page = parseInt(userFilter.page, 10) || 1;
  const limit = parseInt(userFilter.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const usersAggregation = await User.aggregate([
    { $match: { vendorId: vendor._id, role: 'customer' } },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        paginatedResults: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              phoneNumber: 1,
              address: 1
            }
          },
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
  const results = usersAggregation[0].paginatedResults;
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults: totalUsers
  };
};


exports.getWeeklyOrdersCount = async (vendorId) => {
  const today = moment().startOf('day');
  const sevenWeeksAgo = moment(today).subtract(6, 'weeks').startOf('isoWeek');

  const orders = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        createdAt: { $gte: sevenWeeksAgo.toDate() }
      }
    },
    {
      $project: {
        week: { $isoWeek: "$createdAt" },
        year: { $isoWeekYear: "$createdAt" }
      }
    },
    {
      $group: {
        _id: { week: "$week", year: "$year" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.week": 1 }
    }
  ]);

  // Build last 7 week labels
  const labels = [];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const weekMoment = moment(today).subtract(i, 'weeks').startOf('isoWeek');
    const weekNumber = weekMoment.isoWeek();
    const year = weekMoment.isoWeekYear();
    const label = `Week ${7 - i}`;

    const found = orders.find(o => o._id.week === weekNumber && o._id.year === year);
    labels.push(label);
    data.push(found ? found.count : 0);
  }

  return { labels, data };
};
