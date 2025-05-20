const Product = require('../models/product');
const Reservation = require('../models/reservation');

exports.viewCart = (req, res) => {
  const cart = req.session.cart || [];
  res.render('cart', { cart });
};

exports.addToCart = async (req, res) => {
  const product = await Product.findById(req.params.id);
  const cart = req.session.cart || [];

  const existing = cart.find(item => item._id == product._id.toString());

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ _id: product._id, name: product.name, price: product.price, quantity: 1 });
  }

  req.session.cart = cart;
  res.redirect('/products');
};

exports.reserveCart = async (req, res) => {
    const { name, contact, email } = req.body; // Capture the email from the form
    const cart = req.session.cart || [];

    // Create a new reservation with the email
    const reservation = new Reservation({
        name,
        contact,
        email, // Include the email here
        items: cart,
        status: 'Pending'
    });

    try {
        await reservation.save(); // Save the reservation to the database
        req.session.cart = []; // Clear the cart after reservation
        res.redirect('/cart'); // Redirect to reservations page
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving reservation');
    }
};

  

exports.viewReservations = async (req, res) => {
  const reservations = await Reservation.find();
  res.render('reservations', { reservations });
};


exports.approveReservation = async (req, res) => {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
  
    if (!reservation || reservation.status === 'Approved') {
      return res.redirect('/reservations');
    }
  
    // Reduce quantity per item
    for (const item of reservation.items) {
      const product = await Product.findById(item._id);
      if (product && product.quantity >= item.quantity) {
        product.quantity -= item.quantity;
        await product.save();
      } else {
        return res.send(`Not enough stock for ${item.name}`);
      }
    }
  
    reservation.status = 'Approved';
    await reservation.save();
  
    res.redirect('/reservations');
  };
  

  exports.removeReservation = async (req, res) => {
    const reservationId = req.params.id;
    
    try {
      // Find and delete the reservation by its ID
      await Reservation.findByIdAndDelete(reservationId);
      res.redirect('/reservations'); // Redirect back to reservations page
    } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred while removing the reservation');
    }
  };
  