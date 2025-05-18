const Product = require("../models/productModel");
const Avail = require("../models/Avail"); 

// //kay ken ito
// exports.getShop = (req, res) => {
//   res.render("availProduct");
// };


// Show Add Product Form
exports.showAddProductForm = (req, res) => {
  res.render("addProduct");
};

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const { name, category, description, quantity, unit, price, supplier, dateAcquired, acquisitionType } = req.body;

    const newProduct = new Product({
      name,
      category,
      description,
      quantity,
      unit,
      price,
      supplier,
      dateAcquired,
      acquisitionType,
    });

    await newProduct.save();
    res.redirect("/admin/add");
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Error adding product");
  }
};

// Show All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("productList", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching products");
  }
};

// Show Edit Product Form
exports.showEditForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render("editProduct", { product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching product");
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, description, quantity, unit, price, supplier, dateAcquired, acquisitionType } = req.body;

    await Product.findByIdAndUpdate(req.params.id, {
      name,
      category,
      description,
      quantity,
      unit,
      price,
      supplier,
      dateAcquired,
      acquisitionType,
    });

    res.redirect("/admin");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
};

// Show Add Stock Form
exports.showAddStockForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render("addStock", { product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching product");
  }
};

// Add Stocks to Product
exports.addStocks = async (req, res) => {
    try {
      const { quantity } = req.body;
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        return res.status(404).send("Product not found");
      }
  
      product.quantity += parseInt(quantity, 10);
      await product.save();
  
      res.redirect("/admin");  // Redirect to product list after updating
    } catch (error) {
      console.error("Error adding stocks:", error);
      res.status(500).send("Error adding stocks");
    }
  };
  

// Get Low Stock Products
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ quantity: { $lt: 5 } }); // Alert if quantity < 5
    res.render("lowStock", { lowStockProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching low stock products");
  }
};


exports.getReport = async (req, res) => {
    try {
      const products = await Product.find();
      const avails = await Avail.find();
  
      let totalRevenue = 0;
      const totalAvailed = {};
      const personSpending = {}; 
  
      avails.forEach(avail => {
        if (!totalAvailed[avail.productName]) {
          totalAvailed[avail.productName] = { quantity: 0, totalPrice: 0 };
        }
  
        const product = products.find(p => p.name === avail.productName);
        const pricePerUnit = product ? product.price : 0;
        const totalProductPrice = avail.quantity * pricePerUnit;
  
        totalAvailed[avail.productName].quantity += avail.quantity;
        totalAvailed[avail.productName].totalPrice += totalProductPrice;
        totalRevenue += totalProductPrice;
  
        if (!personSpending[avail.name]) {
          personSpending[avail.name] = 0;
        }
        personSpending[avail.name] += totalProductPrice;
      });
  
      res.render("report", { products, avails, totalAvailed, totalRevenue, personSpending });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).send("Error generating report");
    }
  };
  
  // Show the avail form
exports.getAvailForm = async (req, res) => {
    try {
      const products = await Product.find();
      res.render("availProduct", { products, message: null });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Error fetching products");
    }
  };
  
  // Process availing a product
  exports.processAvail = async (req, res) => {
    const { name, address, contact, productId, quantity } = req.body;
  
    try {
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).send("Product not found");
      }
  
      if (quantity > product.quantity) {
        return res.render("availProduct", { products: await Product.find(), message: "Not enough stock available!" });
      }
  
      // Deduct the availed quantity
      product.quantity -= quantity;
      await product.save();
  
      // Save the avail details
      const avail = new Avail({
        name,
        address,
        contact,
        productName: product.name,
        quantity,
        date: new Date()
      });
  
      await avail.save();
  
      res.render("availProduct", { products: await Product.find(), message: "Product availed successfully!" });
    } catch (error) {
      console.error("Error availing product:", error);
      res.status(500).send("Error availing product");
    }
  };