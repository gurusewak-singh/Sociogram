// backend/config/cors.js
const cors = require('cors');

const corsOptions = {
  // Allow only your specific frontend origin
  origin: process.env.CLIENT_URL,
  
  // Allow credentials (cookies, auth headers) to be sent
  credentials: true,
};

console.log(`[CORS] Middleware configured for origin: ${process.env.CLIENT_URL}`);

module.exports = cors(corsOptions);