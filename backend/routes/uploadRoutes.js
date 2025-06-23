// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary'); // Import our Multer config
const { verifyToken } = require('../middlewares/authMiddleware');

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  // 'image' is the name of the form field for the file
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // The file is uploaded by multer-storage-cloudinary. 
  // req.file.path contains the secure URL from Cloudinary.
  res.status(200).json({ 
    message: 'File uploaded successfully', 
    imageUrl: req.file.path 
  });
});

module.exports = router;