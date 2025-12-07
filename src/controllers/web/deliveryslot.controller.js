const slotService = require('../../services/web/deliveryslot.service');

const createSlot = async (req, res) => {
  const slot = await slotService.createSlot(req.body);
  res.status(201).send({ message: 'Slot created', data: slot });
};

const updateSlot = async (req, res) => {
  const slot = await slotService.updateSlot(req.params.id, req.body);
  res.send({ message: 'Slot updated', data: slot });
};

const getAllSlots = async (req, res) => {
  const slots = await slotService.getAllSlots();
  res.send(slots);
};

module.exports = {
  createSlot,
  updateSlot,
  getAllSlots,
};
