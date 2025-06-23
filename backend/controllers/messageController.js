// backend/controllers/messageController.js
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const { getSocketId } = require('../socketManager');

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id; // From verifyToken middleware

    // Find if a conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If not, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create the new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    // Save the message and add its ID to the conversation
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    
    // This will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // --- SOCKET.IO LOGIC ---
    const io = req.app.get('socketio');
    const receiverSocketId = getSocketId(receiverId);

    if (receiverSocketId) {
      // Send the 'newMessage' event only to the specific receiver's socket
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages"); // Populate the 'messages' array with actual message documents

    if (!conversation) {
      return res.status(200).json([]); // No conversation yet, return empty array
    }

    res.status(200).json(conversation.messages);

  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};