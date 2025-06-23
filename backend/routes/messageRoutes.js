// backend/routes/messageRoutes.js
const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// The ID in the route is the ID of the user you are sending the message TO
router.post('/send/:id', verifyToken, sendMessage);

// The ID in the route is the ID of the user you are fetching a conversation WITH
router.get('/:id', verifyToken, getMessages);

module.exports = router;