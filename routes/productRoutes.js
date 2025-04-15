const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");

// Route to show all products
router.get("/products/avail", productController.getAllProducts);

// Route to add a product to the cart
router.post("/cart/add/:id", cartController.addToCart);

// Route to view the cart
router.get("/cart", cartController.viewCart);

// Route to checkout (reservation)
router.post("/cart/checkout", cartController.checkout);

// Route to view reservations (cart form data)
router.get("/reservations", cartController.viewReservations);


router.get("/reservations", cartController.viewReservations);

router.get('/cart', cartController.viewCart);

router.post('/reservations/approve/:id', cartController.approveReservation);


// Show Add Product Form
router.get("/add", productController.showAddProductForm);
router.post("/add", productController.addProduct);

// Show All Products
router.get("/", productController.getAllProducts);

// Show Edit Product Form
router.get("/edit/:id", productController.showEditForm);
router.post("/edit/:id", productController.updateProduct);

// Delete Product
router.post("/delete/:id", productController.deleteProduct);

// Show Add Stocks Form
router.post("/add-stocks/:id", productController.addStocks);


// Low Stock Alert Route
router.get("/low-stock", productController.getLowStockProducts);


router.get("/report", productController.getReport);

router.get("/avail", productController.getAvailForm);
router.post("/avail", productController.processAvail);

module.exports = router;
