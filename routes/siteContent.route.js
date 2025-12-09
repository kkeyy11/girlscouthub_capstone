// routes/siteContent.route.js
const express = require('express');
const router = express.Router();
const siteContentController = require('../controllers/siteContentController');
const multer = require('multer');
const path = require('path');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Admin edit page
router.get('/admin/site-content', siteContentController.getAdminEdit);

// ✅ Banner upload
router.post('/admin/site-content/banner', upload.single('banner'), siteContentController.updateBanner);

// ✅ Add gallery image
router.post('/admin/site-content/gallery', upload.single('gallery'), siteContentController.addGalleryImage);

// ✅ Delete banner
router.delete('/admin/site-content/banner', siteContentController.deleteBanner);

// ✅ Delete gallery image
router.delete('/admin/site-content/gallery/:id', siteContentController.deleteGalleryImage);

module.exports = router;
