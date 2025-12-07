const DeliverySlot = require('../../models/deliveryslot.model');

const createSlot = async (data) => {
  return DeliverySlot.create(data);
};

const updateSlot = async (id, data) => {
  return DeliverySlot.findByIdAndUpdate(id, data, { new: true });
};

const getAllSlots = async () => {
  return DeliverySlot.find({ isActive: true });
};

module.exports = {
  createSlot,
  updateSlot,
  getAllSlots,
};
