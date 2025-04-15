const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    items: [
        {
            productId: String,
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    dateReserved: {
        type: Date,
        default: Date.now
    },
    reservedBy: {
        type: String, // optional: pwede lagyan ng pangalan
        default: "Anonymous"
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);
