const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const warehouseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true
    },
    capacity: {
      type: Number, // in kg
      required: true
    },
    currentStock: {
      type: Number,
      default: 0
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // References a Vendor
    }
  },
  { timestamps: true }
);

// Geospatial index for proximity searches
warehouseSchema.index({ location: '2dsphere' });
warehouseSchema.plugin(toJSON);
warehouseSchema.plugin(paginate);

module.exports = mongoose.model('Warehouse', warehouseSchema);