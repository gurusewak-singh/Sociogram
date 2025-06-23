// backend/controllers/friendController.js

const User = require('../models/user');
const { getSocketId } = require('../socketManager');
const Notification = require('../models/notification');

exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.id;
    const socketio = req.app.get('socketio');

    console.log(`[ACTION] User ${senderId} is sending a friend request to ${receiverId}.`);

    // Find both users to ensure they exist
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const senderUser = await User.findById(senderId);
    if (!senderUser) {
      return res.status(404).json({ message: "Sender not found." });
    }
    if (senderId === receiverId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }
    if (senderUser.friends.some(friendId => friendId.toString() === receiverId)) {
      return res.status(400).json({ message: "You are already friends." });
    }
    if (receiverUser.friendRequests.some(reqId => reqId.toString() === senderId)) {
      return res.status(400).json({ message: "Friend request already sent." });
    }
    if (senderUser.friendRequests.some(reqId => reqId.toString() === receiverId)) {
      return res.status(400).json({ message: "This user has already sent you a friend request. Please check your requests." });
    }

    receiverUser.friendRequests.push(senderId);
    await receiverUser.save();
    console.log(`[DB] Successfully saved friend request to receiver's document.`);

    // --- CREATE NOTIFICATION IN DB ---
    await new Notification({
        recipient: receiverId,
        sender: senderId,
        type: 'friend_request',
        entityId: senderId, // The entity is the sender
    }).save();

    // --- SOCKET EMISSION LOGGING ---
    console.log(`[SOCKET] Attempting to find socket for receiver ID: ${receiverId}`);
    const receiverSocketId = getSocketId(receiverId);

    if (receiverSocketId) {
      const senderSlim = await User.findById(senderId).select('_id username profilePic');
      const payload = {
          _id: senderSlim._id,
          username: senderSlim.username,
          profilePic: senderSlim.profilePic,
          message: `${senderSlim.username} sent you a friend request.`
      };

      console.log(`[SOCKET] ✅ SUCCESS: Found socket ID ${receiverSocketId}. Emitting 'friend-request-received' with payload:`, JSON.stringify(payload, null, 2));
      
      socketio.to(receiverSocketId).emit("friend-request-received", payload);

    } else {
      console.log(`[SOCKET] ❌ FAILED: User ${receiverId} is not online or not found in socket map. No event sent.`);
    }
    // -----------------------------

    res.status(200).json({ message: "Friend request sent successfully" });

  } catch (err) {
    console.error("Error in sendFriendRequest:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.id;
    const io = req.app.get('socketio');
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);
    if (!sender) {
        return res.status(404).json({ message: "Sender not found." });
    }
    if (!receiver.friendRequests.some(id => id.toString() === senderId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }
    receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);
    await receiver.save();
    await sender.save();

    const senderSocket = getSocketId(senderId);
    if (senderSocket && io) {
        // --- THIS IS THE KEY ---
        // Notify the original sender that they have a new friend
        io.to(senderSocket).emit("friendship-accepted", {
            newFriend: {
                _id: receiver._id,
                username: receiver.username,
                profilePic: receiver.profilePic,
                // Add any other fields the frontend needs
            }
        });
        io.to(senderSocket).emit("friend-request-accepted", {
            by: { _id: receiver._id, username: receiver.username },
            message: `${receiver.username} accepted your friend request.`
        });
        // --- NEW NOTIFICATION EMIT ---
        io.to(senderSocket).emit("new-notification", {
            message: `${receiver.username} accepted your friend request.`,
        });
    }
    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (err) {
    console.error("Error in acceptFriendRequest:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.id;
    const receiver = await User.findById(receiverId);
    if (!receiver.friendRequests.some(id => id.toString() === senderId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }
    receiver.friendRequests = receiver.friendRequests.filter(idObj => idObj.toString() !== senderId);
    await receiver.save();
    res.status(200).json({ message: "Friend request rejected successfully" });
    // --- NEW NOTIFICATION EMIT ---
    const senderSocket = getSocketId(senderId);
    const io = req.app.get('socketio');
    if (senderSocket && io) {
      io.to(senderSocket).emit("new-notification", {
        message: `${receiver.username} rejected your friend request.`,
      });
    }
  } catch (err) {
    console.error("Error in rejectFriendRequest:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userWithRequests = await User.findById(userId)
                                     .populate('friendRequests', 'username email profilePic');
    if (!userWithRequests) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(userWithRequests.friendRequests);
  } catch (err) {
    console.error("Error in getFriendRequests:", err);
    res.status(500).json({ message: "Failed to retrieve friend requests: " + err.message });
  }
};

exports.getFriendList = async (req, res) => {
  try {
    const userId = req.user.id;
    const userWithFriends = await User.findById(userId)
                                    .populate('friends', 'username email profilePic');
    if (!userWithFriends) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(userWithFriends.friends);
  } catch (err) {
    console.error("Error in getFriendList:", err);
    res.status(500).json({ message: "Failed to retrieve friend list: " + err.message });
  }
};

exports.markNotificationsAsRead = async (req, res) => {
  try {
    // Accepts an array of notification IDs in req.body.ids
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No notification IDs provided' });
    }
    // Only update notifications that belong to the current user
    const result = await Notification.updateMany(
      { _id: { $in: ids }, recipient: req.user.id },
      { $set: { read: true } }
    );
    res.status(200).json({ message: 'Notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.params.id; // The user to whom the request was sent

        // Find the receiver and pull the sender's ID from their friendRequests array
        const receiver = await User.findByIdAndUpdate(receiverId, {
            $pull: { friendRequests: senderId }
        });

        if (!receiver) {
            return res.status(404).json({ message: "Request not found or already actioned." });
        }
        res.status(200).json({ message: "Friend request cancelled." });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};