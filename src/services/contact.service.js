const Contact = require('../models/contact.model');

const createContact = async (contactBody) => {
  return Contact.create(contactBody);
};

const getContacts = async () => {
  return Contact.find().sort({ createdAt: -1 });
};

module.exports = {
  createContact,
  getContacts,
};
