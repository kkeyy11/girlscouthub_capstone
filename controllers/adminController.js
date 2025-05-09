const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Inventory = require('../models/inventory.model');  // Import the Inventory model

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
},
// Update appointment status (confirm, complete, cancel)
updateAppointmentStatus: async (req, res, next) => {
    const { id, status } = req.params;
    try {
        const validStatuses = ['Confirmed', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).send('Invalid status.');
        }

        // Update the status of the appointment
        await Appointment.findByIdAndUpdate(id, { status });

        req.flash('success', `Appointment status updated to ${status}`);
        res.redirect('/admin/appointments');
    } catch (error) {
        next(error);
    }
},



    // Get all inventory items
    // getInventory: async (req, res, next) => {
    //     try {
    //         const inventory = await Inventory.find();  // Fetch all inventory items
    //         res.render('inventory', { inventory });
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // // Create a new inventory item
    // createInventory: async (req, res, next) => {
    //     const { itemName, quantity, price } = req.body;
    //     try {
    //         const newInventoryItem = new Inventory({
    //             itemName,
    //             quantity,
    //             price
    //         });
    //         await newInventoryItem.save();
    //         req.flash('success', 'Inventory item added successfully!');
    //         res.redirect('/admin/inventory');  // Redirect to the inventory page
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // // Update an inventory item
    // updateInventory: async (req, res, next) => {
    //     const { itemId, itemName, quantity, price } = req.body;
    //     try {
    //         await Inventory.findByIdAndUpdate(itemId, {
    //             itemName,
    //             quantity,
    //             price
    //         });
    //         req.flash('success', 'Inventory item updated successfully!');
    //         res.redirect('/admin/inventory');
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // // Delete an inventory item
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
