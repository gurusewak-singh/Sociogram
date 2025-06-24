// backend/controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../config/mailer');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      needsSetup: true, // Mark this user for the onboarding flow
    });
    
    await newUser.save();

    // Log the user in immediately
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const userObject = newUser.toObject();
    delete userObject.password;

    // Send back token and user object
    res.status(201).json({ token, user: userObject });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ... login, forgotPassword, resetPassword functions remain exactly the same ...
exports.login = async (req, res) => {
  try {
    const { emailOrUsername = "", password } = req.body;

    let user;

    if(emailOrUsername.includes('@')){
      user = await User.findOne({email: emailOrUsername})
    }
    else {
      user = await User.findOne({username: emailOrUsername})
    }
    if(!user) {
      return res.status(404).json({message: "User not found"})
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
      return res.status(400).json({message: "Invalid credentials"})
    }  
    
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
    res.json({token, user});
  } catch(err) {
    res.status(500).json({message: err.message})
  }
};

exports.forgotPassword = async (req, res) => {
  let user; // Declare user in the function's scope
  try {
    // 1. Get user based on posted email
    user = await User.findOne({ email: req.body.email });
    if (!user) {
      // To prevent leaking info, we send a success response even if the user isn't found.
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // 2. Generate the random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3. Hash the token and set it on the user document
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 4. Set the expiration time (10 minutes from now)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // 5. Create the reset URL and send the email with a user-friendly message
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `Forgot your password? Click the link below to reset it.\n\n${resetURL}\n\nIf you didn't request a password reset, please ignore this email. This link is valid for 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: 'Your Sociogram Password Reset Link',
      message,
    });

    res.status(200).json({ message: 'A password reset link has been sent to your email.' });
  } catch (err) {
    // In case of error, clear the token fields to allow the user to try again
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    }
    console.error("FORGOT PASSWORD ERROR: ", err);
    res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // 1. Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user by the hashed token and check if it's not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2. If token has not expired, and there is a user, set the new password
    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }
    
    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // 3. Hash and update the password, then clear the reset fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4. (Optional) Log the user in by creating a new token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};