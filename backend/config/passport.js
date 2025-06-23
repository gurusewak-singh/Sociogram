// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const jwt = 'jsonwebtoken';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback" // Must match the one in Google Console
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Existing OAuth user is logging in, no setup needed.
        user.needsSetup = false; // Ensure it's false for returning users
        return done(null, user);
      } else {
        // If user does not exist, check if the email is already in use
        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
        if (existingEmailUser) {
          // If email exists, link the Google account to it
          existingEmailUser.googleId = profile.id;
          existingEmailUser.profilePic = existingEmailUser.profilePic || profile.photos[0].value;
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }
        
        // --- THIS IS THE NEW USER CREATION LOGIC ---
        const newUser = new User({
          googleId: profile.id,
          // Create a temporary, unique username. User will be forced to change it.
          username: `user_${Date.now()}`,
          email: profile.emails[0].value,
          profilePic: profile.photos[0].value,
          // --- ADD THIS FLAG ---
          needsSetup: true, 
        });
        await newUser.save();
        return done(null, newUser);
      }
    } catch (err) {
      return done(err, false);
    }
  }
));