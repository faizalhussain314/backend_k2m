const mongoose = require('mongoose');
const { User } = require('./user.model');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), // Email validation
      message: 'Invalid email format'
    }
  },
  accessLevel: {
    type: String,
    enum: ['super_admin', 'inventory_manager', 'support_staff'],
    default: 'inventory_manager'
  },
  permissions: {
    manageVendors: { type: Boolean, default: false },
    manageInventory: { type: Boolean, default: true },
    viewReports: { type: Boolean, default: true }
  }
});

module.exports = User.discriminator('admin', adminSchema);