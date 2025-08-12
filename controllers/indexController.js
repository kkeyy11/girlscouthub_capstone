const Appointment = require('../models/appointment.model');
const Product = require('../models/product');
const Event = require('../models/Event');
const District = require('../models/District');
const School = require('../models/School');

const indexController = {
  getIndex: async (req, res, next) => {
    try {
      const appointmentCount = await Appointment.countDocuments();
      const productCount = await Product.countDocuments();
      const districtCount = await District.countDocuments();

      const events = await Event.find({ date: { $gte: new Date() } })
        .sort({ date: 1 })
        .limit(5);

      const appointmentStatusCounts = await Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      const latestAppointments = await Appointment.find()
        .sort({ date: -1 })
        .limit(5)
        .populate('user', 'firstName lastName');

      const productCategories = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);

      // ✅ Get Top 3 Districts with most Schools
      const topDistricts = await School.aggregate([
        {
          $group: {
            _id: "$district",
            schoolCount: { $sum: 1 }
          }
        },
        {
          $sort: { schoolCount: -1 }
        },
        {
          $limit: 3
        },
        {
          $lookup: {
            from: 'districts',
            localField: '_id',
            foreignField: '_id',
            as: 'districtInfo'
          }
        },
        {
          $unwind: '$districtInfo'
        },
        {
          $project: {
            name: '$districtInfo.name',
            schoolCount: 1
          }
        }
      ]);

      res.render('index', {
        appointmentCount,
        productCount,
        districtCount,
        appointmentStatusCounts,
        latestAppointments,
        productCategories,
        events,
        topDistricts,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
};

module.exports = indexController;
