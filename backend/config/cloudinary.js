// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer'); // Fix: require multer properly

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sociogram', // A folder name in your Cloudinary account
    // --- THIS IS THE KEY CHANGE ---
    format: 'png', // Force all uploaded files to be converted to PNG
    public_id: (req, file) => {
      // Try to get username from req.user or req.body, fallback to 'user'
      let username = 'user';
      if (req.user && req.user.username) {
        username = req.user.username;
      } else if (req.body && req.body.username) {
        username = req.body.username;
      }
      return `sociogram_${username}_${Date.now()}`;
    },
    // Apply transformations for quality and size
    transformation: [
        { width: 1080, height: 1080, crop: "limit" },
        { quality: "auto:good" }
    ]
  },
});

// Create the Multer upload instance
const upload = multer({ storage: storage });

module.exports = upload;