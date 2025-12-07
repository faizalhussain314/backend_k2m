const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const addressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{6}$/.test(v), // Indian pincode validation
        message: 'Invalid pincode format (must be 6 digits)'
      }
    },
    landmark: String,
    isDefault: {
      type: Boolean,
      default: false
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
    }
  },
  { timestamps: true }
);

// Geospatial index for delivery route optimization
addressSchema.index({ location: '2dsphere' });
addressSchema.plugin(toJSON);

module.exports = mongoose.model('Address', addressSchema);