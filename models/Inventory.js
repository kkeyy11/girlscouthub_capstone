const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the inventory schema
const inventorySchema = new Schema({
    itemName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });  // Automatically add createdAt and updatedAt fields

// Create the Inventory model
const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
