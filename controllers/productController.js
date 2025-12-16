const Product = require('../models/Product');

// Get list of products
exports.getProductList = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('manageProducts', { products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products');
  }
};

// Get manage products page
exports.getManageProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('manageProducts', { products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products');
  }
};


// Get add product form
exports.getAddProduct = (req, res) => {
  res.render('addProduct');
};

// Add new product
exports.postAddProduct = async (req, res) => {
  try {
    const { name, category, subcategory, variant, description, quantity, price, supplier } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const newProduct = new Product({
      name,
      category,
      subcategory,
      variant,
      description,
      quantity,
      price,
      supplier,
      image,
      dateAcquired: new Date()
    });

    await newProduct.save();
    res.redirect('/manage-products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add product');
  }
};

// Get edit product form
exports.getEditProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.render('editProduct', { product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching product');
  }
};

// ✅ Post edit product (FIXED)
exports.postEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, category, subcategory, description, variant } = req.body;

    const updateData = {
      name,
      price,
      quantity,
      category,
      subcategory,
      description,
      variant
    };

    // If a new image is uploaded, update it
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(id, updateData);

    res.redirect('/manage-products');
  } catch (err) {
    console.error('Edit product error:', err);
    res.status(500).send('Failed to update product');
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/manage-products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete product');
  }
};

// Add stock
exports.addStock = async (req, res) => {
  try {
    const { addQty } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');

    product.quantity += parseInt(addQty);
    await product.save();
    res.redirect('/manage-products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add stock');
  }
};

// Low stock
exports.lowStock = async (req, res) => {
  try {
    const products = await Product.find({ quantity: { $lt: 10, $gt: 0 } });
    res.render('lowStock', { products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching low stock products');
  }
};

// Cancel item (special)
exports.cancelItem = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');

    product.quantity = 0;
    await product.save();
    res.redirect('/manage-products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to cancel item');
  }
};
