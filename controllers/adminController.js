const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Inventory = require('../models/inventory.model');  // Import for future use
const { sendAppointmentEmail } = require('../utils/mailer');

const adminController = {
    // Get all users
    getUsers: async (req, res, next) => {
        try {
            const users = await User.find();
            res.render('manage-users', { users });
        } catch (error) {
            next(error);
        }
    },

    
    // Get all appointments with user email and profile image
getAllAppointments: async (req, res, next) => {
    try {
        const appointments = await Appointment.find().populate('user', 'firstName lastName email profileImage');
        res.render('admin-appointments-list', { appointments });
    } catch (error) {
        next(error);
    }
},


   

    // Update appointment status and send email notification
    updateAppointmentStatus: async (req, res, next) => {
        const { id, status } = req.params;
        try {
            const validStatuses = ['Confirmed', 'Completed', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).send('Invalid status.');
            }

            const appointment = await Appointment.findById(id).populate('user', 'email');
            if (!appointment) {
                req.flash('error', 'Appointment not found.');
                return res.redirect('/admin/appointments');
            }

            appointment.status = status;
            await appointment.save();

            // Send email
            const subject = `Your Appointment Has Been ${status}`;
            const text = `Hello,\n\nYour appointment on ${appointment.date.toDateString()} at ${appointment.time} is now '${status}'.\n\nDescription: ${appointment.description}\n\nThank you.`;
            await sendAppointmentEmail(appointment.user.email, subject, text);

            req.flash('success', `Appointment status updated to ${status}`);
            res.redirect('/admin/appointments');
        } catch (error) {
            next(error);
        }
    },

    // Delete appointment
deleteAppointment: async (req, res, next) => {
  const { id } = req.params;

  try {
    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // ✅ IMPORTANT: respond with JSON, NOT redirect
    res.status(200).json({ message: 'Appointment deleted successfully' });

  } catch (error) {
    next(error);
  }
},



    
};

module.exports = adminController;
