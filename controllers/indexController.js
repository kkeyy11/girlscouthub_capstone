const Appointment = require('../models/appointment.model');
const Product = require('../models/product');
const Event = require('../models/Event');
const District = require('../models/District');
const School = require('../models/School');
const Reservation = require('../models/Reservation');

const indexController = {
  getIndex: async (req, res, next) => {
    try {
      // Summary counts
      const appointmentCount = await Appointment.countDocuments();
      const productCount = await Product.countDocuments();
      const districtCount = await District.countDocuments();

      // Upcoming events
      const events = await Event.find({ date: { $gte: new Date() } })
        .sort({ date: 1 })
        .limit(5);

      // Latest appointments
      const latestAppointments = await Appointment.find()
        .sort({ date: -1 })
        .limit(5)
        .populate('user', 'firstName lastName');

      // Actual sales per category
      const productSales = await Reservation.aggregate([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $group: {
            _id: "$productDetails.category",
            totalSales: { $sum: "$items.quantity" }
          }
        }
      ]);

      // Total revenue
      const totalRevenueAgg = await Reservation.aggregate([
        { $unwind: "$items" },
        { $group: { _id: null, revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } } }
      ]);
      const totalRevenue = totalRevenueAgg[0]?.revenue || 0;

      // Total orders
      const totalOrders = await Reservation.countDocuments();

      // Top-selling products
      const topProducts = await Reservation.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]);

      // Top 3 districts
      const topDistricts = await School.aggregate([
        { $group: { _id: "$district", schoolCount: { $sum: 1 } } },
        { $sort: { schoolCount: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: 'districts',
            localField: '_id',
            foreignField: '_id',
            as: 'districtInfo'
          }
        },
        { $unwind: '$districtInfo' },
        { $project: { name: '$districtInfo.name', schoolCount: 1 } }
      ]);

      // 🔹 MONTHLY ANALYTICS
      const monthlyData = await Reservation.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: { month: { $month: "$date" }, year: { $year: "$date" } },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      // 🔹 WEEKLY ANALYTICS
      const weeklyData = await Reservation.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: { week: { $week: "$date" }, year: { $year: "$date" } },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } }
      ]);

      // 🔹 YEARLY ANALYTICS
      const yearlyData = await Reservation.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: { year: { $year: "$date" } },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1 } }
      ]);

      // 2. Top Categories per Month
      const topCategoriesPerMonth = await Reservation.aggregate([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $group: {
            _id: { month: { $month: "$date" }, category: "$productDetails.category" },
            totalSold: { $sum: "$items.quantity" }
          }
        },
        { $sort: { "_id.month": 1, totalSold: -1 } }
      ]);

      // Render index page
      res.render('index', {
        appointmentCount,
        productCount,
        districtCount,
        latestAppointments,
        productSales,
        events,
        topDistricts,
        totalRevenue,
        topProducts,
        totalOrders,
        monthlyData,
        weeklyData,
        yearlyData,
        topCategoriesPerMonth,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
};

module.exports = indexController;
