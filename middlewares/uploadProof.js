const multer = require('multer');
const path = require('path');

// Storage folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/proofs');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG files are allowed'), false);
  }
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
