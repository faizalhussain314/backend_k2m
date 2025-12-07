const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const complaintSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  complaintType: {
    type: String,
    enum: ['Issue with Order', 'Complain on Vendor', 'Damaged Product', 'Change Address','Change Number', 'Others'],
    default: 'Issue with Order',
  },
  complaintDetails: {
    type: String,
    required: true,
    trim: true,
  },
  complaintStatus: {
    type: String,
    enum: ['Pending', 'Resolved', 'In Progress'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a model from the schema
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
