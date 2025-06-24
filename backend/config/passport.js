// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // For returning users, ensure needsSetup is false.
        user.needsSetup = false; 
        await user.save();
        return done(null, user);
      } else {
        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
        if (existingEmailUser) {
          // Link account and ensure needsSetup is false.
          existingEmailUser.googleId = profile.id;
          existingEmailUser.profilePic = existingEmailUser.profilePic || profile.photos[0].value;
          existingEmailUser.needsSetup = false;
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }
        
        // --- NEW USER CREATION ---
        const newUser = new User({
          googleId: profile.id,
          // Create a temporary, unique username. User will be forced to change it.
          username: `user_${Date.now()}`,
          email: profile.emails[0].value,
          profilePic: profile.photos[0].value,
          needsSetup: true, // <-- SET THE FLAG
        });
        await newUser.save();
        return done(null, newUser);
      }
    } catch (err) {
      return done(err, false);
    }
  }
));