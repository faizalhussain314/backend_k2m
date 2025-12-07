const express = require('express');
const router = express.Router();
const validate = require('../../middlewares/validate');
const contactValidation = require('../../validations/contact.validation');
const contactController = require('../../controllers/contact.controller');
const auth = require('../../middlewares/auth');

router.post('/', validate(contactValidation.createContact), contactController.createContact);

// Admin can view submitted contact forms
router.get('/', contactController.getContacts);

module.exports = router;
