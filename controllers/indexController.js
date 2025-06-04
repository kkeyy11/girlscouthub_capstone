const Appointment = require('../models/appointment.model');
const District = require('../models/districtModel');
const Product = require('../models/product');

const indexController = {
  getIndex: async (req, res, next) => {
    try {
      // Fetch counts
      const appointmentCount = await Appointment.countDocuments();
      const districtCount = await District.countDocuments();
      const productCount = await Product.countDocuments();

      // Appointment status counts
      const appointmentStatusCounts = await Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      // Latest 5 appointments with user populated (assuming user model has 'name')
      const latestAppointments = await Appointment.find()
        .sort({ date: -1 })
        .limit(5)
        .populate('user', 'name');

      // Product categories summary
      const productCategories = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);

      // Render 'index' view with data
      res.render('index', {
        appointmentCount,
        districtCount,
        productCount,
        appointmentStatusCounts,
        latestAppointments,
        productCategories
      });
    } catch (error) {
      console.error(error);
      next(error); // pass error to express error handler
    }
  }
};

module.exports = indexController;
