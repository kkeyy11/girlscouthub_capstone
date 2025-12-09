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
  console.log('🚀 Attempting to delete appointment with ID:', id);

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('❌ Invalid appointment ID:', id);
    req.flash('error', 'Invalid appointment ID.');
    return res.redirect('/admin/appointments');
  }

  try {
    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      console.log('⚠️ Appointment not found for ID:', id);
      req.flash('error', 'Appointment not found.');
      return res.redirect('/admin/appointments');
    }

    console.log('✅ Successfully deleted appointment:', deleted._id);
    req.flash('success', 'Appointment deleted successfully!');
    return res.redirect('/admin/appointments'); // ✅ redirect instead of returning JSON

  } catch (err) {
    console.error('❌ Error deleting appointment:', err);
    req.flash('error', 'Server error while deleting appointment.');
    return res.redirect('/admin/appointments');
  }
},




    
};

module.exports = adminController;
