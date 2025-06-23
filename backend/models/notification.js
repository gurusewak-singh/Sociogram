// backend/models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'friend_request'], 
    required: true 
  },
  // --- NOTE: This is our source of truth. It can be a Post ID or User ID. ---
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // --- NOTE: There is no 'post' field. This is correct. ---
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);