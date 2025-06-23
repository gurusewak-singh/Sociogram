// backend/config/cors.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept"
  ],
  credentials: true,
};

console.log(`[CORS] Reverted. Initializing CORS for client URL: ${process.env.CLIENT_URL}`);

module.exports = cors(corsOptions);