const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const vendorService = require('../../services/web/vendor.service');

const createVendor = async (req, res) => {
  if (!req.files?.govtId?.[0]) {
    return res.status(400).json({ message: 'Government ID image is required.' });
  }

  if (!req.files?.govtId2?.[0]) {
    return res.status(400).json({ message: 'Government ID 2 image is required.' });
  }

  const vendorData = {
    ...req.body,
    govtId: req.files?.govtId?.[0] ? `/uploads/${req.files.govtId?.[0].filename}` : null, 
    govtId2: req.files.govtId2?.[0] ? `/uploads/${req.files.govtId2?.[0].filename}` : null, 

  };

  const vendor = await vendorService.createVendor(vendorData);
  res.status(201).json(vendor);
};

const updateVendor = async (req, res) => {
  // req.body.govtId and req.body.govtId2 contain existing URLs if no new upload

  const govtIdPath = req.files?.govtId?.[0]
    ? `/uploads/${req.files.govtId[0].filename}`
    : req.body.govtId;

  const govtId2Path = req.files?.govtId2?.[0]
    ? `/uploads/${req.files.govtId2[0].filename}`
    : req.body.govtId2;

  if (!govtIdPath) {
    return res.status(400).json({ message: 'Government ID image is required.' });
  }

  if (!govtId2Path) {
    return res.status(400).json({ message: 'Government ID 2 image is required.' });
  }

  const vendorData = {
    ...req.body,
    govtId: govtIdPath,
    govtId2: govtId2Path,
  };
  try {
    const vendor = await vendorService.updateVendor(req.params.vendorId, vendorData);
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Failed to update vendor.' });
  }
};



const deleteVendor = async (req, res) => {
  await vendorService.deleteVendor(req.params.vendorId);
  res.status(200).json({ message: 'Vendor deleted' });
};

// const getVendorById = async (req, res) => {
//   const vendor = await vendorService.getVendorById(req.params.vendorId);
//   res.status(200).json(vendor);
// };

const getVendorById = async (req, res) => {

  try {
    
    const { type = 'both' } = req.query;

    const userFilter = {
      page: parseInt(req.query['userFilter.page'], 10) || 1,
      limit: parseInt(req.query['userFilter.limit'], 10) || 10,
    };

    const orderFilter = {
      page: parseInt(req.query['orderFilter.page'], 10) || 1,
      limit: parseInt(req.query['orderFilter.limit'], 10) || 10,
    };

    const vendor = await vendorService.getVendorById(
      req.params.vendorId,
      userFilter,
      orderFilter,
      type
    );

    res.status(200).json(vendor);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || 'Internal Server Error',
    });
  }
};

const getVendors = async (req, res) => {
  const vendors = await vendorService.getVendors(req.query);
  res.status(200).json(vendors);
};

const getVendorsdata = async (req, res) => {  
  const vendors = await vendorService.getVendorsdata();
  res.status(200).json(vendors);
};

const changeVendorStatus = async (req, res) => {
  const vendor = await vendorService.changeStatus(req.params.vendorId, req.body.status);
  res.status(200).json(vendor);
};

module.exports = {
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorById,
  getVendors,
  changeVendorStatus,
  getVendorsdata
};
