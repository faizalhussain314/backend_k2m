// /controllers/web/complaint.controller.js
const httpStatus = require('http-status');
const complaintService = require('../services/complaint.service');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createComplaint = catchAsync(async (req, res) => {
  const complaint = await complaintService.createComplaint(req.user._id,req.body);
 res.status(httpStatus.CREATED).send({
      message: "Complaint created successfully",
      complaint, 
    });
});

const getComplaints = catchAsync(async (req, res) => {
  const complaints = await complaintService.getComplaints(req.query);
  res.send(complaints);
});


const getComplaintById = catchAsync(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.complaintId);
  if (!complaint) {
   throw new ApiError(res, httpStatus.NOT_FOUND, 'Complaint not found');
  }
   res.status(httpStatus.CREATED).send({
      message: "Complaint fetched successfully",
      complaint, 
    });
});

const updateComplaintStatus = catchAsync(async (req, res) => {
  const complaint = await complaintService.updateComplaintStatus(req.params.complaintId, req.body.status);
  if (!complaint) {
   throw new ApiError(res, httpStatus.NOT_FOUND, 'Complaint not found');
  }
   res.status(httpStatus.CREATED).send({
      message: "Complaint status updated successfully",
      complaint, 
    });
});

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
};
