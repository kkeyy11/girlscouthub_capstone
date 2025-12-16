const Product = require("../models/Product");


let cart = [];
let invoiceData = {};


exports.renderPOS = async (req, res) => {
const products = await Product.find();
res.render("pointofsale", { user: req.user, products, cart });
};


exports.toPayment = (req, res) => {
cart = JSON.parse(req.body.cart);
const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
invoiceData.total = total;
res.render("payment", { user: req.user, total });
};


exports.processPayment = async (req, res) => {
const cash = Number(req.body.cash);
const total = invoiceData.total;


if (cash < total) return res.redirect("/pos");


for (let item of cart) {
await Product.findByIdAndUpdate(item.id, { $inc: { quantity: -item.qty } });
}


invoiceData = {
invoiceNo: "INV-" + Date.now(),
cart,
total,
cash,
change: cash - total
};


res.redirect("/pos/summary");
};


exports.paymentSummary = async (req, res) => {
const updatedProducts = await Product.find();
res.render("paymentsummary", { user: req.user, invoiceData, updatedProducts });
};