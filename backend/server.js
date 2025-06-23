// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { createServer } = require('http');
const { Server } = require('socket.io');
const passport = require('passport');

const corsMiddleware = require('./config/cors');
require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const friendRoutes = require('./routes/friendRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { socketHandler } = require('./socketManager');

const app = express();
const httpServer = createServer(app);

// --- SOCKET.IO CONFIG ---
// This explicit config is correct.
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

app.set('socketio', io);
socketHandler(io);


// --- MIDDLEWARE ---
// Reverting to the clear, standard order.
app.use(corsMiddleware); // CORS first
app.use(express.json()); // Then body parsers
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // Then passport

// --- API ROUTES ---
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// ... (Rest of your server.js file: root route, mongoose connection, listeners...)

// A simple root route
app.get('/api', (req, res) => {
  res.send('Social Media API is running 🚀');
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// --- Socket.IO base connection listener
io.on('connection', (socket) => {
  console.log('A user connected via main server listener:', socket.id);
  socket.emit('welcome', 'Welcome to the Social Media Platform!');
  socket.on('disconnect', () => {
    console.log('User disconnected via main server listener:', socket.id);
  });
});

// --- Server Listening ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});