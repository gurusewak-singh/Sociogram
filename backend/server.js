// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // <-- Keep the import here

dotenv.config(); // --- VITAL CHANGE --- Move this line to the very top, before any other imports from your project

const { createServer } = require('http');
const { Server } = require('socket.io');
const passport = require('passport'); // It's fine to import it here now

// Now require your files that DEPEND on process.env
const corsMiddleware = require('./config/cors');
require('./config/passport'); // Now this will work correctly

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const friendRoutes = require('./routes/friendRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes'); // <-- Import
const { socketHandler } = require('./socketManager');

const app = express();
const httpServer = createServer(app); // Create HTTP server from Express app

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*" || process.env.CLIENT_URL
, // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

// IMPORTANT: Make io accessible to your routes/controllers
app.set('socketio', io);

// Initialize your custom socket event handlers
socketHandler(io);

// --- MIDDLEWARE ---
// THE ORDER HERE IS CRITICAL

// 1. CORS Middleware FIRST: This must be the first middleware to handle
//    preflight (OPTIONS) requests correctly.
app.use(corsMiddleware);

// 2. Body Parsers SECOND: Now that CORS has approved the request,
//    we can parse the JSON or URL-encoded body.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Passport Middleware (if you use it session-wide, which we do)
app.use(passport.initialize());

// --- API ROUTES ---
// 4. Your routes LAST: Only after all middleware is set up,
//    do we direct the request to our route handlers.
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// A simple root route
app.get('/api', (req, res) => {
  res.send('Social Media API is running 🚀');
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err.message)); // Added colon for clarity

// --- Socket.IO base connection listener (optional, as socketHandler handles specific logic) ---
// This is often included in socketManager.js itself, but can be here for a general connection log
io.on('connection', (socket) => {
  console.log('A user connected via main server listener:', socket.id); // Differentiate from socketManager's log if any

  // Example: Send a welcome message to the connected client
  socket.emit('welcome', 'Welcome to the Social Media Platform!');

  socket.on('disconnect', () => {
    console.log('User disconnected via main server listener:', socket.id);
  });
});

// --- Server Listening ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => { // Use httpServer to listen, not app
  console.log(`Server is running on port ${PORT}`);
});