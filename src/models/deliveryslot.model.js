const mongoose = require('mongoose');

const deliverySlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['Morning', 'Evening'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
        },
        message: props => `${props.value} is not a valid 12-hour time format (HH:MM AM/PM)`,
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
        },
        message: props => `${props.value} is not a valid 12-hour time format (HH:MM AM/PM)`,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliverySlot', deliverySlotSchema);
