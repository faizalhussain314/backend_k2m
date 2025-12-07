
const { Customer, Address } = require('../models');
const { Order } = require('../models/order.model');
const { User } = require('../models/user.model');
const DeliverySlot = require('../models/deliveryslot.model');
const Cart  = require('../models/cart.model');
const Vendor = require('../models/vendor.model');

require('dotenv').config();
const baseUrl = process.env.BASE_URL;

const { Product } = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');


const attachImageUrl = (product) => {
  if (product && product.image) {
    product.image = `${baseUrl}${product.image}`;
  }
  return product;
};

const getCustomerProfile = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  return customer;
};

const updateCustomerProfile = async (customerId, updateBody) => {
  const customer = await Customer.findByIdAndUpdate(customerId, updateBody, { new: true });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  return customer;
};

const addCustomerAddress = async (customerId, addressBody) => {
  const address = new Address({ ...addressBody, customer: customerId });
  await address.save();
  return address;
};

const getCustomerAddresses = async (customerId) => {
  return Address.find({ customer: customerId });
};
const getVendor = async (phoneNumber) => {
  const customer = await User.findOne({ phoneNumber, role: "customer" }).lean();
  if (!customer) throw new Error('Customer not found');

  if (!customer.vendorId) throw new Error('Vendor ID not found for customer');

  const vendor = await Vendor.findById(customer.vendorId).lean();
  if (!vendor) throw new Error('Vendor record not found');

  const vendorUser = await User.findById(vendor.userId).lean();
  if (!vendorUser || vendorUser.role !== "vendor") {
    throw new Error('Vendor user not found or invalid role');
  }

  return {
    name: vendorUser.name,
    phoneNumber: vendorUser.phoneNumber,
    email: vendorUser.email,
    address: vendorUser.address,
    mapUrl: vendorUser.mapUrl,
    landMark: vendorUser.landMark,
    latitude: vendorUser.latitude,
    longitude: vendorUser.longitude,
  };
};



const deleteCustomerAddress = async (customerId, addressId) => {
  const address = await Address.findOneAndDelete({ _id: addressId, customer: customerId });
  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }
  return address;
};

const getAvailableProducts = async ({
  category,
  name,
  subcategory,
  page = 1,      // Default if not provided
  limit = 10     // Default if not provided
}) => {
  const query = { active: true };

  // Build dynamic filters
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (name) query.name = { $regex: name, $options: 'i' };

  // Validate and sanitize pagination parameters
  page = Math.max(1, parseInt(page)) || 1;          // Ensure minimum page 1
  limit = Math.min(Math.max(1, parseInt(limit)), 100) || 10;  // Cap at 100 max

  const skip = (page - 1) * limit;

  const [totalResults, results] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
  ]);

  return {
    results: results.map(attachImageUrl),
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults
    }
  };
};
const getAvailableQuickProducts = async (category, name, subcategory) => {
  const query = { quickPicks: true ,active:true};
  if (category) {
    query.category = category;
  }

  if (subcategory) {
    query.subcategory = subcategory;
  }

  if (name) {
    query.name = { $regex: name, $options: 'i' }; // case-insensitive partial search
  }

  const products = await Product.find(query);
  return products.map((product) => attachImageUrl(product.toObject()));};

const getNewlyProducts = async (category, name, subcategory) => {
  const query = { newlyAdd: true ,active:true};
  if (category) {
    query.category = category;
  }

  if (subcategory) {
    query.subcategory = subcategory;
  }

  if (name) {
    query.name = { $regex: name, $options: 'i' }; // case-insensitive partial search
  }

  const products = await Product.find(query);
  return products.map((product) => attachImageUrl(product.toObject()));};



const addToCart = async (customerId, cartItem) => {
  const existingItem = await Cart.findOne({ customer: customerId, productId: cartItem.productId });

  if (existingItem) {
    existingItem.quantity = cartItem.quantity;
    await existingItem.save();
    return existingItem;
  }
  const newItem = new Cart({
    ...cartItem,
    customer: customerId,
  });

  await newItem.save();
  return newItem;
};

const getCustomerCart = async (customerId) => {
  const cartItems = await Cart.find({ customer: customerId }).populate('productId');

  return cartItems.map((item) => {
    const itemObj = item.toObject();
    if (itemObj.productId) {
      itemObj.productId = attachImageUrl(itemObj.productId);
    }
    return itemObj;
  });
};


const removeFromCart = async (customerId, cartItemId) => {
  const item = await Cart.findOneAndDelete({ _id: cartItemId, customer: customerId });
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }
  return item;
};

// const placeOrder = async (customerId, { items }) => {

//   const customer = await User.findById(customerId);

//   if (!customer || !customer.vendorId) {
//     throw new Error('Customer does not have an associated vendor.');
//   }

//   const products = await Product.find({ _id: { $in: items.map(item => item.productId) } });

//   const totalPrice = parseFloat(items.reduce((total, item) => {
//     const product = products.find(p => p._id.toString() === item.productId.toString()); 
//     if (product) {
//       return total + (product.price * (item.quantity / 1000)); // Assuming quantity is in grams and price is per kg
//     }
//     return total;
//   }, 0).toFixed(2)); // makes sure float result is clean

//   const order = new Order({
//     customer: customerId,
//     vendor: customer.vendorId, 
//     items,
//     totalPrice,
//     status: 'placed',
//     createdAt: new Date(),
//   });

//   await order.save();
//   for (let item of items) {
//     const product = products.find(p => p._id.toString() === item.productId.toString());
    
//     if (product) {
//       const quantityInKg = item.quantity / 1000; 
//       if (product.stock < quantityInKg) {
//         throw new Error(`Not enough stock for product ${product.name}`);
//       }

//       product.stock -= quantityInKg;
//        if (product.stock < 1) {
//         product.active = false;
//       }
//       await product.save();
//     }
//   }

//   await Cart.deleteMany({ customer: customerId });

//   return order;
// };

const convertToMinutes = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const placeOrder = async (customerId, { items }) => {
  const customer = await User.findById(customerId);
  if (!customer || !customer.vendorId) {
    throw new Error('Customer does not have an associated vendor.');
  }

  const products = await Product.find({ _id: { $in: items.map(item => item.productId) } });

  const enrichedItems = items.map(item => {
    const product = products.find(p => p._id.toString() === item.productId.toString());
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price, 
    };
  });

  const totalPrice = parseFloat(items.reduce((total, item) => {
    const product = products.find(p => p._id.toString() === item.productId.toString()); 
    if (!product) return total;
      if (product.unit === 'kg') {
          const quantityInKg = item.quantity / 1000;
          return total + (product.price * quantityInKg);
        } else if (product.unit === 'piece') {
          return total + (product.price * item.quantity); // No conversion
        } else {
          throw new Error(`Unknown unit type for product ${product.name}`);
        }
      }, 0).toFixed(2));

  // 🔁 FETCH Delivery Slots and determine batch
  const deliverySlots = await DeliverySlot.find({ isActive: true });
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let batch = 'Morning';
  // for (const slot of deliverySlots) {
  //   const startMinutes = convertToMinutes(slot.startTime);
  //   const endMinutes = convertToMinutes(slot.endTime);
  //   if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
  //     batch = slot.name;
  //     break;
  //   }
  // }

  const order = new Order({
    customer: customerId,
    vendor: customer.vendorId, 
    items: enrichedItems,
    totalPrice,
    status: 'placed',
    batch,
  });

  await order.save();

  for (let item of items) {
    const product = products.find(p => p._id.toString() === item.productId.toString());
     if (!product) continue;

     let quantityToReduce;

    if (product.unit === 'kg') {
      quantityToReduce = item.quantity / 1000;
    } else if (product.unit === 'piece') {
      quantityToReduce = item.quantity;
    } else {
      throw new Error(`Unknown unit type for product ${product.name}`);
    }

    if (product.stock < quantityToReduce) {
      throw new Error(`Not enough stock for product ${product.name}`);
    }

    product.stock -= quantityToReduce;
    if (product.stock < 1) {
      product.active = false;
    }
    await product.save();
  }

  await Cart.deleteMany({ customer: customerId });

  return order;
};

const getCustomerOrders = async (customerId) => {
  const orders = await Order.find({ customer: customerId })
    .populate('items.productId')
    .sort({ createdAt: -1 })
    .limit(5);

  return orders.map((order) => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.map((item) => {
      if (item.productId) {
        item.productId = attachImageUrl(item.productId);
      }
      return item;
    });
    return orderObj;
  });
};


const getOrderDetails = async (customerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId }).populate('items.productId');
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const orderObj = order.toObject();
  orderObj.items = orderObj.items.map((item) => {
    if (item.productId) {
      item.productId = attachImageUrl(item.productId);
    }
    return item;
  });

  return orderObj;
};


const cancelOrder = async (customerId, orderId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, customer: customerId },
    { status: 'Cancelled' },
    { new: true }
  );
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

const trackOrder = async (customerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return {
    status: order.status,
    updatedAt: order.updatedAt,
  };
};

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  addCustomerAddress,
  getCustomerAddresses,
  deleteCustomerAddress,
  getAvailableProducts,
  addToCart,
  getCustomerCart,
  removeFromCart,
  placeOrder,
  getCustomerOrders,
  getOrderDetails,
  cancelOrder,
  trackOrder,
  getAvailableQuickProducts,
  getNewlyProducts,
  getVendor
};
