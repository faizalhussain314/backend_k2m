const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const feedbackSchema = mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    images: [String],
    type: {
      type: String,
      enum: ['product', 'delivery', 'vendor'],
      default: 'product'
    }
  },
  { timestamps: true }
);

feedbackSchema.plugin(toJSON);

module.exports = mongoose.model('Feedback', feedbackSchema);