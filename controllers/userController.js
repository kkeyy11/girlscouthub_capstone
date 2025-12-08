const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');

const userController = {
    getProfile: async (req, res, next) => {
        try {
            res.render('profile', { person: req.user });
        } catch (error) {
            next(error);
        }
    },

    getAppointments: async (req, res, next) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id });
        res.render('appointments', { appointments });
    } catch (error) {
        next(error);
    }
},


    addAppointment: async (req, res, next) => {
        try {
            const { date, time, description } = req.body;

            // Check if user already has an appointment on the same date
            const userExistingAppointment = await Appointment.findOne({ user: req.user._id, date });
            if (userExistingAppointment) {
                return res.status(400).send('You already have an appointment on this date. Please delete your existing appointment before booking a new one.');
            }

            // Check if the selected time slot is already taken by another user
            const existingAppointment = await Appointment.findOne({ date, time });
            if (existingAppointment) {
                return res.status(400).send('This time slot is already booked. Please choose another time.');
            }

            // Create and save the appointment
            const newAppointment = new Appointment({
                user: req.user._id,
                date,
                time,
                description
            });
            await newAppointment.save();

            res.redirect('/user/appointments');
        } catch (error) {
            next(error);
        }
    },

    deleteAppointment: async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (appointment.status !== 'Pending') {
            return res.status(400).send('You can only cancel a pending appointment.');
        }

        await Appointment.findByIdAndDelete(req.params.id);
        res.redirect('/user/appointments');
    } catch (error) {
        next(error);
    }
}

};

module.exports = userController;
