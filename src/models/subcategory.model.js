const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
    image: {
      type: String, // Image URL
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subcategorySchema.plugin(toJSON);
subcategorySchema.plugin(paginate);

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
module.exports = Subcategory;
