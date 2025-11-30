const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const { sendAppointmentEmail } = require('../utils/mailer');

const MAX_RESERVATIONS_PER_DAY = 2;

// View cart
exports.viewCart = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const success = req.query.reserved === "success";
    const limit = req.query.limit === "true";

    let reservations = [];
    if (req.user) { // fetch reservations for logged-in user
      reservations = await Reservation.find({ user: req.user._id })
        .sort({ date: -1 })
        .populate('items.productId')
        .populate('user'); // populate user reference
    }

    res.render('cart', { cart, success, limit, reservations, user: req.user });
  } catch (err) {
    console.error('Error loading cart:', err);
    res.render('cart', { cart: [], success: false, limit: false, reservations: [], user: req.user || null });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/products');

    if (!req.session.cart) req.session.cart = [];

    req.session.cart.push({
      productId: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: 1
    });

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/products');
  }
};

// Reserve cart
exports.reserveCart = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');

    const { contact, downpayment } = req.body;
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const reservationCount = await Reservation.countDocuments({
      user: req.user._id,
      date: { $gte: todayStart }
    });

    if (reservationCount >= MAX_RESERVATIONS_PER_DAY) {
      return res.redirect('/cart?limit=true');
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let proofPath = null;
    if (req.file) proofPath = `/uploads/proofs/${req.file.filename}`;

    const reservation = new Reservation({
      user: req.user._id,
      name: req.user.firstName + ' ' + req.user.lastName, // store for old logic
      email: req.user.email, // store for old logic
      contact,
      items: cart,
      total,
      downpayment: Number(downpayment) || 0,
      proofOfPayment: proofPath
    });

    await reservation.save();
    req.session.cart = [];

    // Notify admin
    await sendAppointmentEmail(
      process.env.GMAIL_USER,
      '📩 New Reservation Created',
      `A new reservation has been made by ${req.user.firstName} ${req.user.lastName} (${req.user.email}).  
Contact: ${contact}  
Total: ₱${total}  
Downpayment: ₱${downpayment}  

Please check admin panel.`
    );

    // Notify user
    await sendAppointmentEmail(
      req.user.email,
      '✅ Reservation Received',
      `Hi ${req.user.firstName},

We have received your reservation.

Total: ₱${total}
Downpayment: ₱${downpayment}
Status: Pending

We will verify your proof of payment soon.`
    );

    res.redirect('/cart?reserved=success');
  } catch (err) {
    console.error('Error reserving cart:', err);
    res.status(500).send('Error reserving cart');
  }
};

// Admin: View reservations
exports.viewReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ date: -1 })
      .populate('items.productId')
      .populate('user'); // populate user reference

    // separate pending and approved
    const pendingReservations = reservations.filter(r => r.status === 'Pending');
    const approvedReservations = reservations.filter(r => r.status === 'Approved');

    res.render('reservations', { pendingReservations, approvedReservations });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// Admin: Approve reservation
exports.approveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('user');
    if (!reservation) return res.redirect('/reservations');

    reservation.status = 'Approved';
    await reservation.save();

    const name = reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : reservation.name;
    const email = reservation.user ? reservation.user.email : reservation.email;

    await sendAppointmentEmail(
      email,
      '🎉 Reservation Approved',
      `Hi ${name},

Good news! Your reservation has been approved.

Total: ₱${reservation.total}
Downpayment: ₱${reservation.downpayment}
Status: Approved`
    );

    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/reservations');
  }
};

// Admin: Remove reservation
exports.removeReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/reservations');
  }
};

// USER: Reservation history
exports.viewReservationHistory = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');

    const reservations = await Reservation.find({ user: req.user._id })
      .sort({ date: -1 })
      .populate('items.productId')
      .populate('user');

    res.render('reservationHistory', { reservations });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// USER: Delete reservation
exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
};

// USER: Clear all reservations
exports.clearReservations = async (req, res) => {
  try {
    if (!req.user) return res.redirect('/login');
    await Reservation.deleteMany({ user: req.user._id });
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
};

// USER: Reorder reservation
exports.reorderReservation = async (req, res) => {
  try {
    const prevReservation = await Reservation.findById(req.params.id).populate('items.productId');
    if (!prevReservation) return res.redirect('/cart');

    req.session.cart = prevReservation.items.map(item => ({
      productId: item.productId._id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity
    }));

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
};

// Admin: Get reservation details
exports.getReservationDetails = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('items.productId').populate('user');
    if (!reservation) return res.status(404).json({ error: 'Not found' });
    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
};
