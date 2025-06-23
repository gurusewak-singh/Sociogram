// backend/models/conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  messages: [{ // We will store message IDs here
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: [],
  }],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);