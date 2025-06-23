// backend/routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// --- Google OAuth Routes ---

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // On successful authentication, 'req.user' is populated by Passport
    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect user back to the frontend with the token
    // This is a common pattern for web OAuth flows
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${JSON.stringify(user)}`);
  }
);

module.exports = router;