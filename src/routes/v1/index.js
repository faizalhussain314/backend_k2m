const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const customerRoute = require("./customer.route");
const vendorRoute = require("./vendor.route");

const complaintRoute = require("./complaint.route");
const contactRoute = require("./contact.route");
const categoryRoute = require("./web/category.route");
const subcategoryRoute = require("./web/subcategory.route");
const slotRoute = require("./web/deliveryslot.route");
const settingsRoute = require("./web/setting.route");

const webCustomerRoute = require("./web/customer.route");
const orderRoute = require("./web/order.route");
const productRoute = require("./web/product.route");
const adminRoute = require("./web/admin.route");
const webVendorRoute = require("./web/vendor.route");
const docsRoute = require("./docs.route");
const config = require("../../config/config");
require("../../services");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/api/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/customer",
    route: customerRoute,
  },
  {
    path: "/orders",
    route: orderRoute,
  },
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/customers",
    route: webCustomerRoute,
  },
  {
    path: "/categories",
    route: categoryRoute,
  },
  {
    path: "/subcategories",
    route: subcategoryRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/vendor",
    route: webVendorRoute,
  },
    {
    path: "/api/vendor",
    route: vendorRoute,
  },
  {
    path: "/complaint",
    route: complaintRoute,
  },
  {
    path: "/contact",
    route: contactRoute,
  },
    {
    path: "/slot",
    route: slotRoute,
  },
   {
    path: "/settings",
    route: settingsRoute,
  },
];
const devRoutes = [
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
