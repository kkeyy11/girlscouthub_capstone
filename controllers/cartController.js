const Product = require('../models/product');
const Reservation = require('../models/reservation');
const Notification = require("../models/Notification");


// View Cart
exports.viewCart = async (req, res) => {
  try {
    const sessionCart = req.session.cart || [];
    const cart = [];

    for (let item of sessionCart) {
      const product = await Product.findById(item._id).lean();
      if (product) {
        cart.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          quantity: item.quantity,
        });
      }
    }

    const userEmail = req.session.email || null;
    let reservations = [];

    if (userEmail) {
      reservations = await Reservation.find({ email: userEmail }).sort({ date: -1 });
    }

    res.render("cart", { cart, reservations });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading cart");
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    if (!req.session.cart) req.session.cart = [];

    const existing = req.session.cart.find(item => item._id.toString() === productId);
    if (existing) {
      if (existing.quantity + 1 > product.quantity) {
        return res.send(`Cannot add more. Only ${product.quantity} in stock.`);
      }
      existing.quantity += 1;
    } else {
      if (product.quantity < 1) {
        return res.send(`No stock available for ${product.name}`);
      }
      req.session.cart.push({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }

    if (req.query.redirect === 'cart') return res.redirect('/cart');
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

//Reserve Cart
exports.reserveCart = async (req, res) => {
  const { name, contact, email } = req.body;
  const cart = req.session.cart || [];

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
  });

  const reservation = new Reservation({
    name,
    contact,
    email,
    items: cart.map(item => ({
      productId: item._id, // ✅ ensures product reference is saved
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity
    })),
    total,
    status: 'Pending',
    date: new Date()
  });

  try {
    await reservation.save();
    req.session.email = email;
    req.session.cart = [];
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving reservation');
  }
  
};


// View Reservations
exports.viewReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().lean();

    const groupedReservations = reservations.reduce((groups, res) => {
      const user = res.name || 'Unknown User';
      if (!groups[user]) {
        groups[user] = [];
      }
      groups[user].push(res);
      return groups;
    }, {});

    res.render('reservations', { groupedReservations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Approve Reservation
exports.approveReservation = async (req, res) => {
  const reservationId = req.params.id;
  const reservation = await Reservation.findById(reservationId);

  if (!reservation || reservation.status === 'Approved') {
    return res.redirect('/reservations');
  }

  for (const item of reservation.items) {
    if (!item.productId) {
      return res.send(`Missing product reference for item: ${item.name}. This reservation may have been created before the system was updated.`);
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      return res.send(`Product not found for ${item.name}`);
    }

    if (product.quantity >= item.quantity) {
      product.quantity -= item.quantity;
      await product.save();
    } else {
      return res.send(`Not enough stock for ${item.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
    }
  }

  reservation.status = 'Approved';
  await reservation.save();

  res.redirect('/reservations');
};

// Remove Reservation (Admin)
exports.removeReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservations');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred while removing the reservation.");
  }
};

// View User Reservation History
exports.viewReservationHistory = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.session.userId }).lean();
    res.render('reservationHistory', { reservations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading reservation history');
  }
};

// Delete Single Reservation
exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting reservation');
  }
};

// Clear All Reservations by Email
exports.clearReservations = async (req, res) => {
  try {
    const email = req.session.email;
    if (!email) return res.status(400).send('No email found in session');
    await Reservation.deleteMany({ email });
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error clearing reservations');
  }
};

// Cancel Item from Cart
exports.cancelItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const cart = req.session.cart || [];
    req.session.cart = cart.filter(item => item._id !== itemId);
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};





//bago para sa reorder 

// Reorder from Previous Reservation
// Reorder from Previous Reservation (Updated)
// exports.reorderReservation = async (req, res) => {
//   try {
//     const reservationId = req.params.id;
    
//     // Find the original reservation
//     const originalReservation = await Reservation.findById(reservationId);
    
//     if (!originalReservation) {
//       return res.status(404).send('Reservation not found');
//     }

//     // Check if the reservation belongs to the current user (email-based verification)
//     const userEmail = req.session.email;
//     if (!userEmail || originalReservation.email !== userEmail) {
//       return res.status(403).send('Unauthorized: You can only reorder your own reservations');
//     }

//     // Store user data in session for pre-filling the form
//     req.session.reorderUserData = {
//       name: originalReservation.name,
//       email: originalReservation.email,
//       contact: originalReservation.contact
//     };

//     // Clear current cart
//     req.session.cart = [];

//     // Add items from the original reservation to cart
//     for (const item of originalReservation.items) {
//       // Check if product still exists and has stock
//       const product = await Product.findById(item.productId);
      
//       if (product) {
//         // Check stock availability
//         if (product.quantity >= item.quantity) {
//           req.session.cart.push({
//             _id: item.productId,
//             name: item.name,
//             description: item.description,
//             price: item.price,
//             quantity: item.quantity,
//             image: product.image // Get current image from product
//           });
//         } else {
//           // If not enough stock, add available quantity or skip if none
//           if (product.quantity > 0) {
//             req.session.cart.push({
//               _id: item.productId,
//               name: item.name,
//               description: item.description,
//               price: item.price,
//               quantity: product.quantity, // Use available stock
//               image: product.image
//             });
//           }
//           // You might want to show a warning message about reduced quantity
//         }
//       }
//       // If product doesn't exist anymore, skip it
//     }

//     // Redirect to cart page to show the reordered items
//     res.redirect('/cart');
    
//   } catch (error) {
//     console.error('Reorder error:', error);
//     res.status(500).send('Error processing reorder');
//   }
// };


// Reorder from Previous Reservation (Updated)
// Reorder from Previous Reservation - Direct Save
exports.reorderReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    
    // Find the original reservation
    const originalReservation = await Reservation.findById(reservationId);
    
    if (!originalReservation) {
      return res.status(404).send('Reservation not found');
    }

    // Check if the reservation belongs to the current user (email-based verification)
    const userEmail = req.session.email;
    if (!userEmail || originalReservation.email !== userEmail) {
      return res.status(403).send('Unauthorized: You can only reorder your own reservations');
    }

    // Prepare items for the new reservation (check stock availability)
    const reorderItems = [];
    let total = 0;
    
    for (const item of originalReservation.items) {
      const product = await Product.findById(item.productId);
      
      if (product && product.quantity > 0) {
        // Use available stock or original quantity, whichever is smaller
        const quantityToOrder = Math.min(product.quantity, item.quantity);
        
        const reorderItem = {
          productId: item.productId,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: quantityToOrder
        };
        
        reorderItems.push(reorderItem);
        total += item.price * quantityToOrder;
      }
      // Skip items that are out of stock or no longer exist
    }

    // Create new reservation directly
    const newReservation = new Reservation({
      name: originalReservation.name,
      contact: originalReservation.contact,
      email: originalReservation.email,
      items: reorderItems,
      total: total,
      status: 'Pending',
      date: new Date()
    });

    // Save the new reservation
    await newReservation.save();

    // ✅ Save notification log (new part)
    // await Notification.create({
    //   message: `${originalReservation.name} re-ordered their reservation.`,
    //   reservationId: newReservation._id,
    //   createdAt: new Date()
    // });
    await Notification.create({
  message: `New reorder placed by ${originalReservation.name}`,
  reservationId: newReservation._id,
  role: 'admin'
});

// After saving newReservation
// await Notification.create({
//   message: `New reorder placed by ${originalReservation.name}`,
//   reservationId: newReservation._id,
//   role: 'admin',
//   createdAt: new Date()
// });


    // Update session data
    req.session.email = originalReservation.email;
    req.session.userName = originalReservation.name;
    req.session.userContact = originalReservation.contact;

    // Redirect back to cart page to show updated reservation history
    res.redirect('/cart');
    
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).send('Error processing reorder');
  }
};






// Get Reservation Details for Reorder Preview
exports.getReservationDetails = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.json({ error: 'Reservation not found' });
    }

    // Check if the reservation belongs to the current user
    const userEmail = req.session.email;
    if (!userEmail || reservation.email !== userEmail) {
      return res.json({ error: 'Unauthorized access' });
    }

    // Check stock availability for each item and add warnings
    const itemsWithStockInfo = [];
    
    for (const item of reservation.items) {
      const product = await Product.findById(item.productId);
      
      let stockWarning = null;
      if (!product) {
        stockWarning = 'Product no longer available';
      } else if (product.quantity < item.quantity) {
        if (product.quantity === 0) {
          stockWarning = 'Out of stock';
        } else {
          stockWarning = `Only ${product.quantity} available (you ordered ${item.quantity})`;
        }
      }
      
      itemsWithStockInfo.push({
        ...item.toObject(),
        stockWarning,
        currentStock: product ? product.quantity : 0
      });
    }

    // Return reservation with stock information
    res.json({
      _id: reservation._id,
      name: reservation.name,
      email: reservation.email,
      contact: reservation.contact,
      items: itemsWithStockInfo,
      total: reservation.total,
      date: reservation.date
    });

  } catch (error) {
    console.error('Get reservation error:', error);
    res.json({ error: 'Error loading reservation details' });
  }
};

// View Cart (Updated to include user data for pre-filling)
// View Cart (Updated to include user data for pre-filling)
// exports.viewCart = async (req, res) => {
//   try {
//     const sessionCart = req.session.cart || [];
//     const cart = [];

//     for (let item of sessionCart) {
//       const product = await Product.findById(item._id).lean();
//       if (product) {
//         cart.push({
//           _id: product._id,
//           name: product.name,
//           price: product.price,
//           description: product.description,
//           quantity: item.quantity,
//         });
//       }
//     }

//     const userEmail = req.session.email || null;
//     let reservations = [];

//     if (userEmail) {
//       reservations = await Reservation.find({ email: userEmail }).sort({ date: -1 });
//     }

//     // Get user data for pre-filling form
//     const userData = {
//       name: req.session.userName || '',
//       email: req.session.email || '',
//       contact: req.session.userContact || ''
//     };

//     res.render("cart", { 
//       cart, 
//       reservations, 
//       userData // Pass user data to template
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error loading cart");
//   }
// };


// // Reserve Cart (Updated to store user data in session)
// exports.reserveCart = async (req, res) => {
//   const { name, contact, email } = req.body;
//   const cart = req.session.cart || [];

//   let total = 0;
//   cart.forEach(item => {
//     total += item.price * item.quantity;
//   });

//   const reservation = new Reservation({
//     name,
//     contact,
//     email,
//     items: cart.map(item => ({
//       productId: item._id, // ✅ ensures product reference is saved
//       name: item.name,
//       description: item.description,
//       price: item.price,
//       quantity: item.quantity
//     })),
//     total,
//     status: 'Pending',
//     date: new Date()
//   });

//   try {
//     await reservation.save();
    
//     // Store user data in session for future use
//     req.session.email = email;
//     req.session.userName = name;
//     req.session.userContact = contact;
    
//     req.session.cart = [];
//     res.redirect('/cart');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error saving reservation');
//   }
// };

