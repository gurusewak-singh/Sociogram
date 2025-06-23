// backend/controllers/notificationController.js
const Notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username profilePic _id'); // Populate sender with necessary fields

    res.status(200).json(notifications);
  } catch (err) {
    console.error("!!! CRITICAL ERROR in getNotifications:", err);
    res.status(500).json({ message: "Failed to get notifications.", error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.recipient.toString() !== req.user.id) {
        return res.status(404).json({ message: "Notification not found or you're not the recipient." });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- NEW ENDPOINT LOGIC ---
exports.markNotificationsAsRead = async (req, res) => {
    try {
        // Mark multiple notifications as read, but only for the logged-in user
        // and only for 'like' and 'comment' types.
        await Notification.updateMany(
            { recipient: req.user.id, read: false, type: { $in: ['like', 'comment'] } },
            { $set: { read: true } }
        );
        res.status(200).json({ message: "Informational notifications marked as read." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
