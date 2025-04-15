const Product = require("../models/productModel");
//const Cart = require("../models/ReservationCart");
const Cart = require("../models/Cart");
const Reservation = require('../models/Reservation');
const nodemailer = require('nodemailer');

exports.addToCart = (req, res) => {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity, 10) || 1;  // Get quantity from the form or default to 1
    let cart = req.session.cart || [];

    // Check if the item is already in the cart
    const existingProductIndex = cart.findIndex(item => item._id.toString() === productId);

    if (existingProductIndex !== -1) {
        // If product already exists in the cart, update the quantity
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Otherwise, add the product to the cart
        cart.push({ _id: productId, name: "Product Name", quantity, price: 100 });  // Set product details accordingly
    }

    // Save the cart to the session
    req.session.cart = cart;

    // Redirect to the cart view
    res.redirect("/cart");
};

  
  
exports.viewCart = (req, res) => {
    const cart = req.session.cart || [];  // Get the cart from the session (or an empty array if not available)
    
    // Log cart to the console for debugging
    console.log("Cart content:", cart);
    
    // Pass the cart to the view
    res.render("cartView", { cart });
};


  
  
exports.checkout = async (req, res) => {
    try {
        const selectedIds = req.body.selectedItems;
        const reservedBy = req.body.reservedBy || "Anonymous";

        if (!selectedIds) {
            return res.status(400).send("No items selected");
        }

        const selected = Array.isArray(selectedIds) ? selectedIds : [selectedIds];

        const cart = req.session.cart || [];

        const reservedItems = cart.filter(item => selected.includes(item._id));

        if (reservedItems.length === 0) {
            return res.status(400).send("No matching items in the cart");
        }

        const reservation = new Reservation({
            items: reservedItems,
            reservedBy: reservedBy
        });

        await reservation.save();

        // Remove reserved items from session cart
        req.session.cart = cart.filter(item => !selected.includes(item._id));

        res.redirect("/cart");
    } catch (error) {
        console.error("Reservation failed:", error);
        res.status(500).send("Reservation failed");
    }
};
  
exports.viewReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ dateReserved: -1 });
        res.render("reservationList", { reservations });
    } catch (error) {
        console.error("Error viewing reservations:", error);
        res.status(500).send("Error retrieving reservations");
    }
};

exports.getAllReservations = async (req, res) => {
  try {
    const allReservations = await Reservation.find().sort({ dateReserved: -1 });
    const pending = allReservations.filter(r => !r.isApproved);
    const approved = allReservations.filter(r => r.isApproved);

    res.render('reservationList', {
      reservations: pending,
      approvedReservations: approved
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// APPROVE reservation
// Approve reservation
exports.approveReservation = async (req, res) => {
  try {
      const reservationId = req.params.id;

      // Find the reservation by ID and update its status to 'approved'
      const updatedReservation = await Reservation.findByIdAndUpdate(reservationId, {
          status: 'approved',
      }, { new: true });

      // Redirect back to the reservation list page
      res.redirect('/reservations'); // Update with your actual route
  } catch (err) {
      console.error('Error approving reservation:', err);
      res.status(500).send('Server error');
  }
};


// Controller to render reservation list
exports.getReservationList = async (req, res) => {
  try {
      // Fetch all pending reservations (status: 'pending')
      const reservations = await Reservation.find({ status: 'pending' });

      // Fetch all approved reservations (status: 'approved')
      const approvedReservations = await Reservation.find({ status: 'approved' });

      // Render the view with both pending and approved reservations
      res.render('reservationList', {
          reservations,         // pending reservations
          approvedReservations  // approved reservations
      });
  } catch (err) {
      console.error('Error fetching reservations:', err);
      res.status(500).send('Server error');
  }
};


