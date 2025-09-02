// const Notification = require('../models/Notification');

// // exports.getAdminNotifications = async (req, res) => {
// //   try {
// //     // kuha lang ng mga notifications para sa admin
// //     const notifications = await Notification.find({ role: 'admin' })
// //       .sort({ createdAt: -1 });

// //     res.render('admin/notifications', { notifications });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Error loading admin notifications");
// //   }
// // };




// // const Notification = require('../models/Notification');

// // exports.getAdminNotifications = async (req, res) => {
// //   try {
// //     // kuha lang ng mga notifications para sa admin
// //     const notifications = await Notification.find({ role: 'admin' })
// //       .sort({ createdAt: -1 });

// //     res.render('admin/notifications', { notifications });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Error loading admin notifications");
// //   }
// // };

// // exports.deleteNotification = async (req, res) => {
// //   try {
// //     const notificationId = req.params.id;
    
// //     // Delete the specific notification
// //     const deletedNotification = await Notification.findByIdAndDelete(notificationId);
    
// //     if (!deletedNotification) {
// //       return res.status(404).json({ error: 'Notification not found' });
// //     }
    
// //     res.status(200).json({ message: 'Notification deleted successfully' });
// //   } catch (err) {
// //     console.error('Error deleting notification:', err);
// //     res.status(500).json({ error: 'Error deleting notification' });
// //   }
// // };

// // exports.clearAllNotifications = async (req, res) => {
// //   try {
// //     // Delete all admin notifications
// //     const result = await Notification.deleteMany({ role: 'admin' });
    
// //     res.status(200).json({ 
// //       message: 'All notifications cleared successfully',
// //       deletedCount: result.deletedCount 
// //     });
// //   } catch (err) {
// //     console.error('Error clearing all notifications:', err);
// //     res.status(500).json({ error: 'Error clearing all notifications' });
// //   }
// // };


// // const Notification = require('../models/Notification');

// // GET admin notifications
// exports.getAdminNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({ role: 'admin' })
//       .sort({ createdAt: -1 });

//     res.render('admin/notifications', { notifications });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error loading admin notifications");
//   }
// };

// // DELETE single notification
// exports.deleteNotification = async (req, res) => {
//   try {
//     await Notification.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Notification deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error deleting notification" });
//   }
// };



const Notification = require('../models/Notification');

// GET admin notifications
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ role: 'admin' })
      .sort({ createdAt: -1 });

    console.log("DEBUG Notifications:", notifications); // para makita ilan talaga

    res.render('admin/notifications', { notifications });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading admin notifications");
  }
};

// CREATE or UPDATE (lagi isa lang ang notification)
exports.saveAdminNotification = async (message) => {
  try {
    await Notification.findOneAndUpdate(
      { role: 'admin' },                                  // laging admin
      { message: message, createdAt: new Date(), read: false }, // update message
      { upsert: true, new: true }                         // create kung wala pa
    );
  } catch (err) {
    console.error("Error saving notification:", err);
  }
};

// DELETE single notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting notification" });
  }
};

// CLEAR ALL notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ role: 'admin' });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error clearing notifications" });
  }
};
