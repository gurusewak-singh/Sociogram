// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.put('/read-all', verifyToken, notificationController.markNotificationsAsRead);

module.exports = router;
