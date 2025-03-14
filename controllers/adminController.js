const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');

const adminController = {
    getUsers: async (req, res, next) => {
        try {
            const users = await User.find();
            res.render('manage-users', { users });
        } catch (error) {
            next(error);
        }
    },

    getAllAppointments: async (req, res, next) => {
        try {
            const appointments = await Appointment.find().populate('user', 'email');
            res.render('admin-appointments-list', { appointments });
        } catch (error) {
            next(error);
        }
    }
    
};

module.exports = adminController;
