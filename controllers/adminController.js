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
        await Appointment.findByIdAndDelete(id);
        req.flash('success', 'Appointment deleted successfully.');
        res.redirect('/admin/appointments');
    } catch (error) {
        next(error);
    }
},


    // getInventory: async (req, res, next) => {
    //     try {
    //         const inventory = await Inventory.find();
    //         res.render('inventory', { inventory });
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // createInventory: async (req, res, next) => {
    //     const { itemName, quantity, price } = req.body;
    //     try {
    //         const newInventoryItem = new Inventory({ itemName, quantity, price });
    //         await newInventoryItem.save();
    //         req.flash('success', 'Inventory item added successfully!');
    //         res.redirect('/admin/inventory');
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // updateInventory: async (req, res, next) => {
    //     const { itemId, itemName, quantity, price } = req.body;
    //     try {
    //         await Inventory.findByIdAndUpdate(itemId, { itemName, quantity, price });
    //         req.flash('success', 'Inventory item updated successfully!');
    //         res.redirect('/admin/inventory');
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // deleteInventory: async (req, res, next) => {
    //     const { itemId } = req.params;
    //     try {
    //         await Inventory.findByIdAndDelete(itemId);
    //         req.flash('success', 'Inventory item deleted successfully!');
    //         res.redirect('/admin/inventory');
    //     } catch (error) {
    //         next(error);
    //     }
    // },
};

module.exports = adminController;
