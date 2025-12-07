const mongoose = require('mongoose');
const { User } = require('./user.model');

const customerSchema = new mongoose.Schema({
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  favoriteProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  lastOrderDate: Date
});

module.exports = User.discriminator('customer', customerSchema);
