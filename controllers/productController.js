const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('addProduct');
};
exports.postAddProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      variant,
      description,
      quantity,
      price,
      supplier,
      dateAcquired
    } = req.body;

    // Get image file path from multer
    const imagePath = req.file ? "/uploads/" + req.file.filename : null;

    const product = new Product({
      name,
      category,
      subcategory: subcategory || null,
      variant: variant || null,
      description,
      quantity,
      price,
      supplier,
      dateAcquired,
      image: imagePath // Save image path to MongoDB
    });

    await product.save();
    res.redirect('/manage-products'); // Redirect to the product add form or list
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).send('Failed to save product');
  }
};


  
  // exports.addProduct = async (req, res) => {
  //   const { name, category, description, quantity, price, supplier, dateAcquired } = req.body;
  //   const image = req.file ? '/uploads/' + req.file.filename : ''; // path to use in src
  
  //   const product = new Product({
  //     name,
  //     category,
  //     description,
  //     quantity,
  //     price,
  //     supplier,
  //     dateAcquired,
  //     image
  //   });
  
  //   await product.save();
  //   res.redirect('/products/add');
  // };
  
  

exports.getProductList = async (req, res) => {
  const products = await Product.find();
  res.render('productList', { products });
};

// Modify existing getProductList
exports.getProductList = async (req, res) => {
    const products = await Product.find();
    res.render('productList', { products });
  };
  

  exports.getManageProducts = async (req, res) => {
    const products = await Product.find();
    res.render('manageProducts', { products });
  };
  
  exports.deleteProduct = async (req, res) => {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    res.redirect('/manage-products');
  };
  


  // Show edit form
exports.getEditProductForm = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('editProduct', { product });
  };
  
  // Handle update
  exports.postEditProduct = async (req, res) => {
    const { name, price, quantity } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { name, price, quantity });
    res.redirect('/manage-products');
  };
  
  // Handle stock addition
  exports.addStock = async (req, res) => {
    const { addQty } = req.body;
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { quantity: parseInt(addQty) }
    });
    res.redirect('/manage-products');
  };
  

  // Get low-stock products
exports.lowStock = async (req, res) => {
    try {
      // Find products with quantity less than 5
      const lowStockProducts = await Product.find({ quantity: { $lt: 5 } });
  
      // Render the low-stock page with the products
      res.render('lowStock', { products: lowStockProducts });
    } catch (err) {
      console.log(err);
      res.status(500).send('Server Error');
    }
  };
  

  // Cancel (remove) item from the cart
exports.cancelItem = async (req, res) => {
    try {
      const itemId = req.params.id;
  
      // Assuming you're storing the cart in the session
      const cart = req.session.cart;
  
      // Remove the item with the given ID
      const updatedCart = cart.filter(item => item._id !== itemId);
  
      // Save the updated cart back to the session
      req.session.cart = updatedCart;
  
      // Redirect back to the cart page with the updated cart
      res.redirect('/cart');
    } catch (err) {
      console.log(err);
      res.status(500).send('Server Error');
    }
  };
  

  exports.removeReservation = async (req, res) => {
    const reservationId = req.params.id;
    
    try {
      // Find the reservation by ID and delete it
      await Reservation.findByIdAndDelete(reservationId);
      res.redirect('/reservations'); // Redirect back to the reservations page
    } catch (err) {
      console.error(err);
      res.status(500).send("Error occurred while removing the reservation.");
    }
  };