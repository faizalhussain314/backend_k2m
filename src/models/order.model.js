// order.model.js
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
          ref: 'Product', // Make sure it refers to the 'Product' model
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['placed', 'packing', 'ready', 'dispatch', 'delivered','collected','completed'],
      default: 'placed',
    },
    batch:{
      type: String,
      required: true,
    }
    
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = (await this.constructor.countDocuments()) + 1; // Get the current count and increment
    this.orderId = `ORD_${count.toString().padStart(5, '0')}`;
  }
  next();
});
const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
