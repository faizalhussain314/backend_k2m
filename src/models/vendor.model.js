const mongoose = require('mongoose');
const { User } = require('./user.model');
const paginate = require('./plugins/paginate.plugin'); 

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  govtId: {
    type: String,
    required: true,
    unique: true
  },
  govtId2: {
    type: String,
    required: true,
    unique: true
  },
  vendorCode: {
    type: String,
    required: true,
    unique: true
  },
  serviceLocations: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
});
vendorSchema.plugin(paginate);

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;