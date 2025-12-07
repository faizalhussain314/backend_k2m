// /routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');

const complaintController = require('../../controllers/complaint.controller');
const complaintValidation = require('../../validations/complaint.validation');

// Route to create a complaint
router.post('/', auth('customer'), validate(complaintValidation.createComplaint), complaintController.createComplaint);

// Route to get all complaints (admin only)
router.get('/', auth('admin'), complaintController.getComplaints);

// Route to get a specific complaint by ID
router.get('/:complaintId', auth('admin'), validate(complaintValidation.getComplaint), complaintController.getComplaintById);

// Route to update complaint status (admin only)
router.patch('/:complaintId/status', auth('admin'), validate(complaintValidation.updateStatus), complaintController.updateComplaintStatus);

module.exports = router;
