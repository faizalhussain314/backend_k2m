const httpStatus = require('http-status');
const { User } = require('../../models/user.model'); // Correct way

const { Order } = require('../../models/order.model');

const moment = require('moment');

// Get total customers, total orders, total revenue
const getDashboardSummary = async (req, res) => {
  try {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });

    // Total orders this month
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    res.status(httpStatus.OK).json({
      totalCustomers,
      totalOrders,
      totalVendors
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getChartsSummary = async (req, res) => {
  try {
    const startOfYear = moment().startOf('year').toDate();
    const endOfYear = moment().endOf('year').toDate();

    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: 1 } // count of orders
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = monthNames.map((name, index) => {
      const found = monthlyOrders.find(item => item._id === index + 1);
      return {
        name,
        sales: found ? found.sales : 0
      };
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardSummary,getChartsSummary };
