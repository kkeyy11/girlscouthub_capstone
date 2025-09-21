// controllers/siteContentController.js
const SiteContent = require('../models/SiteContent');
const fs = require('fs');
const path = require('path');

exports.getAdminEdit = async (req, res) => {
  try {
    let siteContent = await SiteContent.findOne();
    if (!siteContent) {
      siteContent = new SiteContent();
      await siteContent.save();
    }
    res.render('adminedit', { siteContent, user: req.user });
  } catch (err) {
    console.error('❌ Error loading admin edit:', err);
    res.status(500).send('Server error');
  }
};

// ✅ Upload Banner
exports.updateBanner = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.redirect('/admin/site-content');

    let siteContent = await SiteContent.findOne();
    if (!siteContent) siteContent = new SiteContent();

    // delete old banner
    if (siteContent.bannerImage) {
      const oldPath = path.join(__dirname, '..', 'public', 'uploads', siteContent.bannerImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    siteContent.bannerImage = file.filename;
    await siteContent.save();

    res.redirect('/admin/site-content');
  } catch (err) {
    console.error('❌ Error updating banner:', err);
    res.status(500).send('Server error');
  }
};

// ✅ Add to Gallery
exports.addGalleryImage = async (req, res) => {
  try {
    const file = req.file;
    const caption = req.body.caption || '';

    if (!file) return res.redirect('/admin/site-content');

    let siteContent = await SiteContent.findOne();
    if (!siteContent) siteContent = new SiteContent();

    siteContent.gallery.push({ filename: file.filename, caption });
    await siteContent.save();

    res.redirect('/admin/site-content');
  } catch (err) {
    console.error('❌ Error adding gallery image:', err);
    res.status(500).send('Server error');
  }
};

// ✅ Delete Gallery Image
exports.deleteGalleryImage = async (req, res) => {
  try {
    const imageId = req.params.id;

    let siteContent = await SiteContent.findOne();
    if (!siteContent) return res.redirect('/admin/site-content');

    const image = siteContent.gallery.id(imageId);
    if (image) {
      const imgPath = path.join(__dirname, '..', 'public', 'uploads', image.filename);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      image.remove();
      await siteContent.save();
    }

    res.redirect('/admin/site-content');
  } catch (err) {
    console.error('❌ Error deleting gallery image:', err);
    res.status(500).send('Server error');
  }
};
