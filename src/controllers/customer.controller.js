const httpStatus = require('http-status');
const customerService = require('../services/customer.service');
const ApiError = require('../utils/ApiError');

class CustomerController {
  async getProfile(req, res) {
    const profile = await customerService.getCustomerProfile(req.user._id);
    res.send(profile);
  }

  async updateProfile(req, res) {
    const updatedProfile = await customerService.updateCustomerProfile(req.user._id, req.body);
    res.send(updatedProfile);
  }

  async addAddress(req, res) {
    const address = await customerService.addCustomerAddress(req.user._id, req.body);
    res.status(httpStatus.CREATED).send(address);
  }

  async getAddresses(req, res) {
    const addresses = await customerService.getCustomerAddresses(req.user._id);
    res.send(addresses);
  }

  async deleteAddress(req, res) {
    const deletedAddress = await customerService.deleteCustomerAddress(req.user._id, req.params.addressId);
    res.send(deletedAddress);
  }
async getProducts(req, res) {
  try {
    const { 
      category, 
      name, 
      subcategory, 
      page,    // Dynamic page from query
      limit    // Dynamic limit from query
    } = req.query;

    const result = await customerService.getAvailableProducts({
      category,
      name, 
      subcategory,
      page: parseInt(page),    // Convert to number
      limit: parseInt(limit)   // Convert to number
    });

    if (result.results.length === 0) {
      return res.status(200).json({  // 200 OK with empty results
        message: 'No products found',
        ...result
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message
    });
  }
}
  
  async getQuickProducts(req, res) {
    const { category, name, subcategory } = req.query;
    const products = await customerService.getAvailableQuickProducts(category, name, subcategory);
  
    if (products.length === 0) {
      return res.status(404).json({ message: 'No product found' });
    }
  
    res.send(products);
  }
   async getNewlyProducts(req, res) {
    const { category, name, subcategory } = req.query;
    const products = await customerService.getNewlyProducts(category, name, subcategory);
  
    if (products.length === 0) {
      return res.status(404).json({ message: 'No product found' });
    }
  
    res.send(products);
  }
  
  async addToCart(req, res) {
    const cartItem = await customerService.addToCart(req.user._id, req.body);
    res.status(httpStatus.CREATED).send(cartItem);
  }

async getVendor(req, res)  {
  try {
    const vendorDetails = await customerService.getVendor(req.body.phoneNumber);
    if (!vendorDetails) {
      return res.status(httpStatus.NOT_FOUND).send({ message: 'Vendor not found' });
    }
    res.status(httpStatus.OK).send(vendorDetails);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
  }
};


  async getCart(req, res) {
    const cart = await customerService.getCustomerCart(req.user._id);
    res.send(cart);
  }

  async removeFromCart(req, res) {
    const cartItem = await customerService.removeFromCart(req.user._id, req.params.cartItemId);
    res.send(cartItem);
  }

  async placeOrder(req, res) {
    const order = await customerService.placeOrder(req.user._id, req.body);
    res.status(httpStatus.CREATED).send(order);
  }

  async getOrders(req, res) {
    const orders = await customerService.getCustomerOrders(req.user._id);
    res.send(orders);
  }

  async getOrderDetails(req, res) {
    const order = await customerService.getOrderDetails(req.user._id, req.params.orderId);
    res.send(order);
  }

  async cancelOrder(req, res) {
    const order = await customerService.cancelOrder(req.user._id, req.params.orderId);
    res.send(order);
  }

  async trackOrder(req, res) {
    const trackingInfo = await customerService.trackOrder(req.user._id, req.params.orderId);
    res.send(trackingInfo);
  }
}

module.exports = new CustomerController();
