const {Order} = require('../../models/order.model');
const ApiError = require('../../utils/ApiError');
const Vendor = require('../../models/vendor.model');
const { User } = require('../../models/user.model');
const httpStatus = require('http-status');
require('dotenv').config();
const baseUrl = process.env.BASE_URL;

const attachImageUrl = (product) => {
  if (product && product.image) {
    product.image = `${baseUrl}${product.image}`;
  }
  return product;
};
const createOrder = async (customerId, orderData) => {
  return Order.create({ customer: customerId, ...orderData });
};

// const getOrders = async (user) => {
//   let orders;

//   if (user.role === 'admin') {
//     orders = await Order.find()
//       .sort({ createdAt: -1 })
//       .populate('customer items.productId');
//   } else {
//     orders = await Order.find({ customer: user.id })
//       .sort({ createdAt: -1 })
//       .populate('items.productId');
//   }

//   // Attach image URL to each product
//   orders = orders.map(order => {
//     order.items = order.items.map(item => {
//       // Ensure productId is populated first
//       if (item.productId) {
//         attachImageUrl(item.productId);
//       }
//       return item;
//     });
//     return order;
//   });

//   return orders;
// };
const getOrders = async (user, filter) => {
  const baseUrl = process.env.BASE_URL;

  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // Filter by status
  if (filter.status) {
    query.status = filter.status;
  }

  // Filter by customer (from query or restrict to logged-in user)
  if (user.role === 'admin') {
    if (filter.customer) {
      query.customer = filter.customer;
    }
  } else {
    query.customer = user.id;
  }

  // Filter by vendor
  if (filter.vendor) {
    query.vendor = filter.vendor;
  }

  // Filter by created date range
  if (filter.dateFrom || filter.dateTo) {
    query.createdAt = {};
    if (filter.dateFrom) query.createdAt.$gte = new Date(filter.dateFrom);
    if (filter.dateTo) query.createdAt.$lte = new Date(filter.dateTo);
  }

  // Search by orderId only (safe field in Order schema)
  if (filter.search) {
    const searchRegex = new RegExp(filter.search, 'i');
    query.orderId = { $regex: searchRegex };
  }

  // Fetch orders and count
  const [orders, totalResults] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer items.productId'),
    Order.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  // Resolve vendor and format results
  const ordersWithVendorInfo = await Promise.all(
    orders.map(async (order) => {
      const orderObj = order.toObject();

      // Format product images
      orderObj.items = orderObj.items.map(item => {
        if (item.productId?.image) {
          item.productId.image = `${baseUrl}${item.productId.image}`;
        }
        return item;
      });

      // Resolve vendor info
      let vendorInfo = {};
      if (orderObj.vendor) {
        const vendorDoc = await Vendor.findById(orderObj.vendor).populate('userId');
        if (vendorDoc?.userId) {
          vendorInfo = {
            _id: vendorDoc._id,
            name: vendorDoc.userId.name,
          };
        }
      }

      // Calculate totalPrice
      // const totalPrice = orderObj.items.reduce((total, item) => {
      //   const product = item.productId;
      //   if (!product) return total;

      //   if (product.unit === 'kg') {
      //     return total + product.price * (item.quantity / 1000);
      //   } else if (product.unit === 'piece') {
      //     return total + product.price * item.quantity;
      //   } else {
      //     return total;
      //   }
      // }, 0).toFixed(2);

      return {
        _id: orderObj._id,
        orderId: orderObj.orderId,
        customer: {
          _id: orderObj.customer?._id,
          name: orderObj.customer?.name || '',
        },
        vendor: vendorInfo,
        date: new Date(orderObj.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        time: new Date(orderObj.createdAt).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: orderObj.status,
        totalPrice : orderObj.totalPrice.toFixed(2),
      };
    })
  );

  return {
    results: ordersWithVendorInfo,
    page,
    limit,
    totalPages,
    totalResults,
  };
};


const getVendorOrdersEvening = async (vendorId, filter) => {
  const baseUrl = process.env.BASE_URL;

  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  query.vendor = vendorId;
  query.status = { $nin: ['delivered', 'collected', 'completed'] };



  // Filter by customer if not admin
  // if (user.role !== 'admin') {
  //   query.customer = user.id;
  // }

  // Search

  if (filter.search) {
    const searchRegex = new RegExp(filter.search, 'i');
  
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
  if (filter.dateFrom || filter.dateTo) {
    const dateRange = {};
    if (filter.dateFrom) dateRange.$gte = new Date(filter.dateFrom);
    if (filter.dateTo) dateRange.$lte = new Date(filter.dateTo);
    query.createdAt = dateRange;
  }
  query.batch = 'Evening';

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
      address: orderObj.customer?.address || ''
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
  totalPrice: orderObj.totalPrice


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
const getVendorOrdersMorning = async (vendorId, filter) => {
  const baseUrl = process.env.BASE_URL;

  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  query.vendor = vendorId;
  query.status = { $nin: ['delivered', 'collected', 'completed'] };


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
  if (filter.dateFrom || filter.dateTo) {
    const dateRange = {};
    if (filter.dateFrom) dateRange.$gte = new Date(filter.dateFrom);
    if (filter.dateTo) dateRange.$lte = new Date(filter.dateTo);
    query.createdAt = dateRange;
  }
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
      address: orderObj.customer?.address || ''
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
    totalPrice: orderObj.totalPrice





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

const getVendorOrders = async (vendorId, filter) => {
  const baseUrl = process.env.BASE_URL;
  const page = parseInt(filter.page) || 1;
  const limit = parseInt(filter.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};


  // Search

  if (filter.search) {
    const searchRegex = new RegExp(filter.search, 'i');
  
    query.$or = [
      { orderId: { $regex: searchRegex, $options: 'i' } },
      { 'customer.name': { $regex: searchRegex, $options: 'i' } },
      { 'vendor.name': { $regex: searchRegex, $options: 'i' } }
    ];
  }
  
  if (vendorId) {
    query.vendor = vendorId;
  }
  // Filter by status
  if (filter.status) {
    query.status = filter.status;
  }

  // Filter by date
  if (filter.dateFrom || filter.dateTo) {
    const dateRange = {};
    if (filter.dateFrom) dateRange.$gte = new Date(filter.dateFrom);
    if (filter.dateTo) dateRange.$lte = new Date(filter.dateTo);
    query.createdAt = dateRange;
  }

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
  
    // Populate product image
    orderObj.items = orderObj.items.map(item => {
      if (item.productId?.image) {
        item.productId.image = `${baseUrl}${item.productId.image}`;
      }
      return item;
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
        
      },
      vendor: {
        _id: orderObj.vendor?._id || null,
        name: orderObj.vendor?.name || '',
      },
      date: new Date(orderObj.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }), // e.g. "13 May 2025"
        time: new Date(orderObj.createdAt).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }), // e.g. "14:30
      status: orderObj.status,

    totalPrice: orderObj.totalPrice

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
const getOrderById = async (orderId) => {
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

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  order.status = status;
  await order.save();
  return order;
};
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const updateVendorOrderStatus = async (vendorId, newStatus, batch) => {
  const filter = {
    vendor: vendorId,
    status: { $ne: 'delivered' },
  };
  if (batch) {
    filter.batch = capitalize(batch);  // normalize batch before query
  }

  const result = await Order.updateMany(
    filter,
    { $set: { status: newStatus } }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No matching orders found or all are already delivered');
  }

  return result;
};
/**
 * Generate report based on filters
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Object>} Report data
 */
const generateReport = async (filter) => {
  const query = {};
  
  // Apply date range filter
  if (filter.startDate || filter.endDate) {
    query.createdAt = {};
    if (filter.startDate) {
      query.createdAt.$gte = new Date(filter.startDate);
    }
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDate;
    }
  }

  // Apply product filter
  if (filter.productId) {
    query['items.productId'] = filter.productId;
  }

  if (filter.vendorId) {
    query.vendor = filter.vendorId;
  }
  // Apply status filter
  if (filter.status) {
    query.status = filter.status;
  }

  // Find orders matching the criteria
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('customer items.productId vendor');

  // Process orders to include product details and calculate totals
  const reportData = await Promise.all(orders.map(async (order) => {
    const orderObj = order.toObject();
    // Get vendor info
    let vendorName = 'Unknown';
    if (orderObj.customer.vendorId) {
      const vendorDoc = await Vendor.findById(orderObj.customer.vendorId).populate('userId');
      if (vendorDoc && vendorDoc.userId) {
        vendorName = vendorDoc.userId.name;
      }
    }
    // Process each item in the order
    const items = orderObj.items.map(item => {
      const product = item.productId;
      if (!product) return null;
      
      let total = 0;
      let formattedQuantity = '';
      
      if (product.unit === 'kg') {
        const quantityInKg = item.quantity / 1000;
        total = product.price * quantityInKg;
        formattedQuantity = `${quantityInKg} kg`;
      } else if (product.unit === 'piece') {
        total = product.price * item.quantity;
        formattedQuantity = `${item.quantity} pcs`;
      }
      
      return {
        productId: product._id,
        productName: product.name,
        quantity: formattedQuantity,
        rawQuantity: item.quantity,
        unit: product.unit,
        price: product.price,
        total: total.toFixed(2)
      };
    }).filter(Boolean); // Remove null items
    
    // Calculate order total
    const orderTotal = orderObj.totalPrice;
    
    return {
      _id: orderObj._id,
      orderId: orderObj.orderId,
      date: new Date(orderObj.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      customerName: orderObj.customer?.name || 'Unknown',
      vendorName,
      vendorId: orderObj.vendor?._id || null,
      status: orderObj.status,
      batch: orderObj.batch || 'N/A',
      items,
      totalAmount: orderTotal.toFixed(2)
    };
  }));
  
  // Calculate summary statistics
  const totalAmount = reportData.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  
  const summary = {
    totalOrders: reportData.length,
    totalAmount: totalAmount.toFixed(2),
    averageOrderValue: reportData.length > 0 ? (totalAmount / reportData.length).toFixed(2) : '0.00',
    statusBreakdown: {} 
  };
  
  // Generate status breakdown
  reportData.forEach(order => {
    if (!summary.statusBreakdown[order.status]) {
      summary.statusBreakdown[order.status] = 0;
    }
    summary.statusBreakdown[order.status]++;
  });
  
  // Add product breakdown with quantity-based counting
  const productCounts = {};
  const productTotals = {};
  const quantityBreakdown = {}; // New: Quantity-based breakdown
  
  reportData.forEach(order => {
    order.items.forEach(item => {
      const productId = item.productId;
      const productName = item.productName;
      
      // Existing product counting
      if (!productCounts[productId]) {
        productCounts[productId] = 0;
        productTotals[productId] = {
          name: productName,
          quantity: 0,
          total: 0
        };
      }
      
      productCounts[productId]++;
      productTotals[productId].quantity += item.rawQuantity;
      productTotals[productId].total += parseFloat(item.total);
      
      // New: Quantity-based breakdown
      const quantityKey = `${productName} - ${item.quantity}`;
      if (!quantityBreakdown[quantityKey]) {
        quantityBreakdown[quantityKey] = {
          productName: productName,
          quantity: item.quantity,
          rawQuantity: item.rawQuantity,
          unit: item.unit,
          count: 0,
          totalAmount: 0
        };
      }
      quantityBreakdown[quantityKey].count++;
      quantityBreakdown[quantityKey].totalAmount += parseFloat(item.total);
    });
  });
  
  // Add quantity breakdown to summary
  summary.quantityBreakdown = quantityBreakdown;
  
  
  return {
    orders: reportData,
    summary
  };
};

/**
 * Generate CSV data for report export
 * @param {Object} filter - Filter criteria
 * @returns {Promise<string>} CSV data
 */
const generateReportCSV = async (filter) => {
  const reportData = await generateReport(filter);
  
  if (reportData.orders.length === 0) {
    return 'No data available for the selected filters';
  }
  
  // Create CSV header
  const headers = [
    'Order ID',
    'Date',
    'Customer Name',
    'Vendor Name',
    'Status',
    'Product Name',
    'Quantity',
    'Total'
  ];
  
  // Create CSV rows
  const rows = [];
  
  // Add order data
  reportData.orders.forEach(order => {
    if (filter.productId) {
      // If filtering by product, only include the filtered product
      const filteredItems = order.items.filter(item => item.productId === filter.productId);
      filteredItems.forEach(item => {
        rows.push([
          order.orderId,
          order.date,
          order.customerName,
          order.vendorName,
          order.status,
          item.productName,
          item.quantity,
          item.total
        ]);
      });
    } else {
      // If not filtering by product, include all items
      order.items.forEach(item => {
        rows.push([
          order.orderId,
          order.date,
          order.customerName,
          order.vendorName,
          order.status,
          item.productName,
          item.quantity,
          item.total
        ]);
      });
    }
  });
  
  // Add summary section
  rows.push([]);
  rows.push(['Report Summary']);
  rows.push(['Total Orders', reportData.summary.totalOrders]);
  rows.push(['Total Amount', reportData.summary.totalAmount]);
  rows.push(['Average Order Value', reportData.summary.averageOrderValue]);
  
  // Add status breakdown
  rows.push([]);
  rows.push(['Status Breakdown']);
  Object.entries(reportData.summary.statusBreakdown).forEach(([status, count]) => {
    rows.push([status, count]);
  });
  
  // Add quantity breakdown
  rows.push([]);
  rows.push(['Quantity Breakdown']);
  rows.push(['Product & Quantity', 'Order Count', 'Total Amount']);
  Object.entries(reportData.summary.quantityBreakdown).forEach(([key, data]) => {
    rows.push([key, data.count, data.totalAmount.toFixed(2)]);
  });
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Handle fields with commas by wrapping in quotes
        if (cell && typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};


module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getVendorOrdersEvening, 
  getVendorOrdersMorning,
  updateVendorOrderStatus,
  getVendorOrders,
  generateReport,
  generateReportCSV
};










