// backend/socketManager.js

let onlineUsers = new Map(); // userId => socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    console.log(`[Socket Manager] New connection with socket ID: ${socket.id}`);
    
    if (userId && userId !== "undefined") {
      console.log(`[Socket Manager] ✅ User identified: ${userId}. Mapping to socket ID: ${socket.id}`);
      onlineUsers.set(userId, socket.id);
      
      // For debugging, let's log the current state of online users
      console.log('[Socket Manager] Current online users:', Array.from(onlineUsers.entries()));

    } else {
      console.log(`[Socket Manager] ⚠️ A guest connected without a userId.`);
    }

    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          disconnectedUserId = key;
          onlineUsers.delete(key);
          break;
        }
      }
      if (disconnectedUserId) {
        console.log(`[Socket Manager] ❌ User disconnected: ${disconnectedUserId}. Socket ID ${socket.id} removed.`);
        console.log('[Socket Manager] Current online users:', Array.from(onlineUsers.entries()));
      } else {
          console.log(`[Socket Manager] A guest with socket ID ${socket.id} disconnected.`);
      }
    });
  });
};

const getSocketId = (userId) => {
  const socketId = onlineUsers.get(userId);
  console.log(`[getSocketId] Searching for user ${userId}. Found socket: ${socketId || 'null'}`);
  return socketId || null;
};

module.exports = { socketHandler, getSocketId };