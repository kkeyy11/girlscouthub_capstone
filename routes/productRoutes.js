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

// PRODUCT ROUTES
router.get('/products', productController.getProductList);

router.get('/add', productController.getAddProduct);
router.post('/add', productController.postAddProduct); // This handles form submission

router.get('/manage-products', productController.getManageProducts);
router.post('/delete-product/:id', productController.deleteProduct);

router.get('/edit-product/:id', productController.getEditProductForm);
router.post('/edit-product/:id', productController.postEditProduct);

router.post('/add-stock/:id', productController.addStock);

// SPECIAL ROUTES
router.get('/low-stock', productController.lowStock);
router.post('/cancel-item/:id', productController.cancelItem);

module.exports = router;
