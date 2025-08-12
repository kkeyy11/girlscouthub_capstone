const Product = require('../models/product');
const Reservation = require('../models/reservation');

// View Cart
exports.viewCart = async (req, res) => {
  try {
    const sessionCart = req.session.cart || [];
    const cart = [];

    for (let item of sessionCart) {
      const product = await Product.findById(item._id).lean();
      if (product) {
        cart.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          quantity: item.quantity,
        });
      }
    }

    const userEmail = req.session.email || null;
    let reservations = [];

    if (userEmail) {
      reservations = await Reservation.find({ email: userEmail }).sort({ date: -1 });
    }

    res.render("cart", { cart, reservations });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading cart");
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    if (!req.session.cart) req.session.cart = [];

    const existing = req.session.cart.find(item => item._id.toString() === productId);
    if (existing) {
      if (existing.quantity + 1 > product.quantity) {
        return res.send(`Cannot add more. Only ${product.quantity} in stock.`);
      }
      existing.quantity += 1;
    } else {
      if (product.quantity < 1) {
        return res.send(`No stock available for ${product.name}`);
      }
      req.session.cart.push({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }

    if (req.query.redirect === 'cart') return res.redirect('/cart');
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Reserve Cart
exports.reserveCart = async (req, res) => {
  const { name, contact, email } = req.body;
  const cart = req.session.cart || [];

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
  });

  const reservation = new Reservation({
    name,
    contact,
    email,
    items: cart.map(item => ({
      productId: item._id, // ✅ ensures product reference is saved
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity
    })),
    total,
    status: 'Pending',
    date: new Date()
  });

  try {
    await reservation.save();
    req.session.email = email;
    req.session.cart = [];
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving reservation');
  }
};

// View Reservations
exports.viewReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().lean();

    const groupedReservations = reservations.reduce((groups, res) => {
      const user = res.name || 'Unknown User';
      if (!groups[user]) {
        groups[user] = [];
      }
      groups[user].push(res);
      return groups;
    }, {});

    res.render('reservations', { groupedReservations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Approve Reservation
exports.approveReservation = async (req, res) => {
  const reservationId = req.params.id;
  const reservation = await Reservation.findById(reservationId);

  if (!reservation || reservation.status === 'Approved') {
    return res.redirect('/reservations');
  }

  for (const item of reservation.items) {
    if (!item.productId) {
      return res.send(`Missing product reference for item: ${item.name}. This reservation may have been created before the system was updated.`);
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      return res.send(`Product not found for ${item.name}`);
    }

    if (product.quantity >= item.quantity) {
      product.quantity -= item.quantity;
      await product.save();
    } else {
      return res.send(`Not enough stock for ${item.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
    }
  }

  reservation.status = 'Approved';
  await reservation.save();

  res.redirect('/reservations');
};

// Remove Reservation (Admin)
exports.removeReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred while removing the reservation.");
  }
};

// View User Reservation History
exports.viewReservationHistory = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.session.userId }).lean();
    res.render('reservationHistory', { reservations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading reservation history');
  }
};

// Delete Single Reservation
exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting reservation');
  }
};

// Clear All Reservations by Email
exports.clearReservations = async (req, res) => {
  try {
    const email = req.session.email;
    if (!email) return res.status(400).send('No email found in session');
    await Reservation.deleteMany({ email });
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error clearing reservations');
  }
};

// Cancel Item from Cart
exports.cancelItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const cart = req.session.cart || [];
    req.session.cart = cart.filter(item => item._id !== itemId);
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
