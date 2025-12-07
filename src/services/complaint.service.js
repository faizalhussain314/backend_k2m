// /services/web/complaint.service.js
const Complaint = require('../models/complaint.model');
const {User} = require('../models/user.model'); // Import the User model

const createComplaint = async (customerId,data) => {
  try {
   const complaint = new Complaint({
      customerId,  
      ...data,     
    });

    await complaint.save();
    return complaint;
  } catch (error) {
    throw new Error('Error creating complaint: ' + error.message);
  }
};


const getComplaints = async (filters) => {
  try {
    // Convert string parameters to numbers
    const { customerId, search } = filters;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    // Build the query object to filter by customerId if provided
    let query = customerId ? { customerId } : {};

    // If we need to search, use aggregation pipeline
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      
      // Use aggregation pipeline for complex search including populated fields
      const aggregationPipeline = [
        // Lookup/join with customer collection
        {
          $lookup: {
            from: 'users', // Assuming your customer collection is named 'users'
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerInfo'
          }
        },
        {
          $unwind: '$customerInfo'
        },
        // Match stage for search
        {
          $match: {
            $and: [
              customerId ? { customerId: customerId } : {},
              {
                $or: [
                  { complaintType: searchRegex },
                  { complaintDetails: searchRegex },
                  { complaintStatus: searchRegex },
                  { 'customerInfo.name': searchRegex },
                  { 'customerInfo.email': searchRegex },
                  { 'customerInfo.phoneNumber': searchRegex }
                ]
              }
            ].filter(condition => Object.keys(condition).length > 0) // Remove empty objects
          }
        },
        // Add fields to restructure the document
        {
          $addFields: {
            customerId: '$customerInfo'
          }
        },
        // Remove the temporary customerInfo field
        {
          $project: {
            customerInfo: 0
          }
        },
        // Sort by creation date (newest first)
        {
          $sort: { createdAt: -1 }
        }
      ];

      // Get total count with search
      const totalCountPipeline = [...aggregationPipeline, { $count: "total" }];
      const totalCountResult = await Complaint.aggregate(totalCountPipeline);
      const totalResults = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

      // Get paginated results
      const complaints = await Complaint.aggregate([
        ...aggregationPipeline,
        { $skip: skip },
        { $limit: limit }
      ]);

      const totalPages = Math.ceil(totalResults / limit);

      return {
        results: complaints,
        page,
        limit,
        totalPages,
        totalResults,
      };
    } else {
      // Original logic for when there's no search term
      const totalResults = await Complaint.countDocuments(query);
      const totalPages = Math.ceil(totalResults / limit);

      const complaints = await Complaint.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('customerId', 'name email phoneNumber');

      return {
        results: complaints,
        page,
        limit,
        totalPages,
        totalResults,
      };
    }
  } catch (error) {
    throw new Error('Error fetching complaints: ' + error.message);
  }
};

const getComplaintById = async (complaintId) => {
  try {
    return await Complaint.findById(complaintId);
  } catch (error) {
    throw new Error('Error fetching complaint: ' + error.message);
  }
};

const updateComplaintStatus = async (complaintId, status) => {
  try {
    return await Complaint.findByIdAndUpdate(
      complaintId,
      { complaintStatus: status, updatedAt: Date.now() },
      { new: true }
    );
  } catch (error) {
    throw new Error('Error updating complaint status: ' + error.message);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
};
