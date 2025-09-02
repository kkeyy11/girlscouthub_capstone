// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema({
//   message: String,
//   reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Notification", notificationSchema);


const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  role: { type: String, default: 'admin' } // para tukuyin kung para sa admin/user
});

module.exports = mongoose.model('Notification', notificationSchema);
