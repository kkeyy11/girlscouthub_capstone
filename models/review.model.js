const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    reservation: { // NEW: link review to a reservation if needed
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
    },

    message: {
        type: String,
        required: true
    },

    sentiment: {
        type: String,
        default: 'Neutral'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);
