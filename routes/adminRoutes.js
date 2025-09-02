// // // const express = require('express');
// // // const router = express.Router();
// // // const adminNotificationController = require('../controllers/adminNotificationController');

// // // // admin notification page
// // // router.get('/admin/notifications', adminNotificationController.getAdminNotifications);

// // // // routes/admin.js
// // // router.get('/notifications', async (req, res) => {
// // //   const notifications = await Notification.find({ role: 'admin' }).sort({ createdAt: -1 });
// // //   res.render('admin/notifications', { notifications });
// // // });


// // // module.exports = router;


// // const express = require('express');
// // const router = express.Router();
// // const adminNotificationController = require('../controllers/adminNotificationController');

// // // admin notification page
// // router.get('/admin/notifications', adminNotificationController.getAdminNotifications);

// // // delete single notification
// // router.delete('/admin/notifications/:id', adminNotificationController.deleteNotification);

// // // clear all notifications
// // //router.delete('/admin/notifications/clear-all', adminNotificationController.clearAllNotifications);

// // // routes/admin.js (keeping your existing route)
// // router.get('/notifications', async (req, res) => {
// //   const notifications = await Notification.find({ role: 'admin' }).sort({ createdAt: -1 });
// //   res.render('admin/notifications', { notifications });
// // });

// // module.exports = router;



// const express = require('express');
// const router = express.Router();
// const adminNotificationController = require('../controllers/adminNotificationController');

// // admin notification page
// router.get('/admin/notifications', adminNotificationController.getAdminNotifications);

// // delete single notification
// router.delete('/admin/notifications/:id', adminNotificationController.deleteNotification);

// // clear all notifications (optional)
// // router.delete('/admin/notifications/clear-all', adminNotificationController.clearAllNotifications);

// module.exports = router;



const express = require('express');
const router = express.Router();
const adminNotificationController = require('../controllers/adminNotificationController');

// Admin notifications page
router.get('/admin/notifications', adminNotificationController.getAdminNotifications);

// Delete single notification
router.delete('/admin/notifications/:id', adminNotificationController.deleteNotification);

// Clear all notifications
router.delete('/admin/notifications/clear-all', adminNotificationController.clearAllNotifications);

module.exports = router;
