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


// ✅ Delete Banner Image
exports.deleteBanner = async (req, res) => {
  try {
    const siteContent = await SiteContent.findOne();
    if (!siteContent || !siteContent.bannerImage) {
      return res.redirect('/admin/site-content');
    }

    const imgPath = path.join(__dirname, '..', 'public', 'uploads', siteContent.bannerImage);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    siteContent.bannerImage = null;
    await siteContent.save();

    req.flash('success', 'Banner image removed.');
    res.redirect('/admin/site-content');
  } catch (err) {
    console.error('❌ Error deleting banner:', err);
    res.redirect('/admin/site-content');
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

// ✅ Delete Gallery Image (SAFE VERSION)
exports.deleteGalleryImage = async (req, res) => {
  try {
    const imageId = req.params.id;

    const siteContent = await SiteContent.findOne();
    if (!siteContent) {
      req.flash('error', 'Site content not found.');
      return res.redirect('/admin/site-content');
    }

    const image = siteContent.gallery.id(imageId);
    if (!image) {
      req.flash('error', 'Image not found.');
      return res.redirect('/admin/site-content');
    }

    // ✅ Safely delete image file
    const imgPath = path.join(__dirname, '..', 'public', 'uploads', image.filename);
    if (fs.existsSync(imgPath)) {
      fs.unlink(imgPath, err => {
        if (err) console.error('❌ Image file delete failed:', err);
      });
    }

    // ✅ Proper subdocument removal (NO server crash)
    siteContent.gallery.pull({ _id: imageId });
    await siteContent.save();

    req.flash('success', 'Gallery image deleted successfully.');
    res.redirect('/admin/site-content');
  } catch (err) {
    console.error('❌ Error deleting gallery image:', err);
    res.redirect('/admin/site-content');
  }
};

