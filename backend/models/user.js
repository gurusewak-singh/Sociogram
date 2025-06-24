// backend/models/user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
    maxlength:25, // Increased slightly for generated names
    minlength: 3
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{ // Password is not required for OAuth users
    type: String,
    minlength: 8
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  profilePic:{
    type: String,
    default: ""
  },
  bio:{
    type: String,
    default: "",
    maxlength: 100
  },
  googleId:{ // <-- ADD THIS FIELD
    type: String, 
  },
  
  friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  friendRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);