const { model } = require('mongoose');


module.exports = {
    Token: require('./token.model'),
    User: require('./user.model'),
    Users: require('./user.model'),
    Customer: require('./customer.model'),
    Vendor: require('./vendor.model'),
    Admin: require('./admin.model'),
    Product: require('./product.model'),
    Order: require('./order.model'),
    Address: require('./address.model'),
    Warehouse: require('./warehouse.model'),
    Feedback: require('./feedback.model'),
    Cart: require('./cart.model'),
    Subcategory: require('./subcategory.model'),

  };