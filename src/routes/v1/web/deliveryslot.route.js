const express = require('express');
const validate = require('../../../middlewares/validate');
const auth = require('../../../middlewares/auth');
const slotValidation = require('../../../validations/web/deliveryslot.validation');
const slotController = require('../../../controllers/web/deliveryslot.controller');
const router = express.Router();

// Admin: Create slot
router.post('/', auth('admin'), validate(slotValidation.createSlot), slotController.createSlot);

// Admin: Update slot
router.put('/:id', auth('admin'), validate(slotValidation.updateSlot), slotController.updateSlot);

// Admin/User: Get all active slots
router.get('/', slotController.getAllSlots);

module.exports = router;
