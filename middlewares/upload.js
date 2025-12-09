const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Dynamic destination (based on route usage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    // ✅ Default upload folder (existing features)
    let uploadPath = 'public/uploads';

    // ✅ Events image upload
    if (req.baseUrl.includes('event')) {
      uploadPath = 'public/uploads/events';
    }

    // ✅ Create folder if not existing
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

// ✅ Image-only filter (keeps your existing logic)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// ✅ Shared upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // ✅ 5MB safe limit
});

module.exports = upload;
