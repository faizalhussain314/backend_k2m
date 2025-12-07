const contactService = require('../services/contact.service');
const Contact = require('../models/contact.model');

const createContact = async (req, res) => {
  const contact = await contactService.createContact(req.body);
  res.status(201).json({ message: 'Contact submitted', data: contact });
};

// controller/contactController.js
const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', searchBy = 'name' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build search query
    let searchQuery = {};
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      
      // Create case-insensitive regex search
      switch (searchBy) {
        case 'name':
          searchQuery = { name: { $regex: searchTerm, $options: 'i' } };
          break;
        case 'mobile':
          searchQuery = { mobile: { $regex: searchTerm, $options: 'i' } };
          break;
        case 'address':
          searchQuery = { address: { $regex: searchTerm, $options: 'i' } };
          break;
        default:
          // If searchBy is not recognized, search across all fields
          searchQuery = {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { mobile: { $regex: searchTerm, $options: 'i' } },
              { address: { $regex: searchTerm, $options: 'i' } }
            ]
          };
      }
    }

    const contacts = await Contact.find(searchQuery)
      .sort({ createdAt: -1 }) // Descending order
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Contact.countDocuments(searchQuery);

    res.status(200).json({
      data: contacts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      search: search || '',
      searchBy: searchBy || 'name'
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
  }
};

module.exports = {
  createContact,
  getContacts,
};
