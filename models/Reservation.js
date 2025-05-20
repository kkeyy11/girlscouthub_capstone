const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  name: String,
  contact: String,
  email: { type: String, required: true }, // Add email field
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  status: { type: String, default: 'Pending' },
  dateReserved: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
