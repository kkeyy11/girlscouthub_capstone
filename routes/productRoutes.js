// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// //const upload = require('../middleware/upload');

// router.get('/products', productController.getProductList);
// router.get('/add', productController.getAddProduct);
// router.post('/add', productController.postAddProduct);
// router.get('/manage-products', productController.getManageProducts);
// router.post('/delete-product/:id', productController.deleteProduct);
// //router.post('/add-product', productController.addProduct);
// router.post('/add-product', //upload.single('image')
//  productController.addProduct);

// router.get('/edit-product/:id', productController.getEditProductForm);
// router.post('/edit-product/:id', productController.postEditProduct);
// router.post('/add-stock/:id', productController.addStock);

// // Route to show low-stock products
// router.get('/low-stock', productController.lowStock);
// // Route to cancel/remove an item from the cart
// router.post('/cancel-item/:id', productController.cancelItem);


// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// //const upload = require('../middleware/upload');

// router.get('/products', productController.getProductList);
// router.get('/add', productController.getAddProduct);
// router.post('/add', productController.postAddProduct);
// router.get('/manage-products', productController.getManageProducts);
// router.post('/delete-product/:id', productController.deleteProduct);
// //router.post('/add-product', productController.addProduct);
// router.post('/add-product', //upload.single('image')
//  productController.addProduct);

// router.get('/edit-product/:id', productController.getEditProductForm);
// router.post('/edit-product/:id', productController.postEditProduct);
// router.post('/add-stock/:id', productController.addStock);

// // Route to show low-stock products
// router.get('/low-stock', productController.lowStock);
// // Route to cancel/remove an item from the cart
// router.post('/cancel-item/:id', productController.cancelItem);


// module.exports = router;



const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middlewares/upload'); // Adjust path as needed

// Add product
router.post('/products/add', upload.single('image'), productController.postAddProduct);

// Product list & forms
router.get('/products', productController.getProductList);
router.get('/add', productController.getAddProduct);
router.get('/manage-products', productController.getManageProducts);
router.post('/delete-product/:id', productController.deleteProduct);

// ✅ Edit product (fixed)
router.get('/edit-product/:id', productController.getEditProductForm);
router.post('/edit-product/:id', upload.single('image'), productController.postEditProduct);

// Stock and special routes
router.post('/add-stock/:id', productController.addStock);
router.get('/low-stock', productController.lowStock);
router.post('/cancel-item/:id', productController.cancelItem);

module.exports = router;


