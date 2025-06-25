// backend/controllers/userController.js
const User = require('../models/user');

// Search users by username or email
exports.searchUsers = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("username email");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
        .select("-password")
        .populate('friends', 'username profilePic');

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    const userId = req.user.id;

    // Fetch the user to access their current data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // --- COOLDOWN LOGIC ---
    // Check if the username is being changed
    if (username && user.username !== username) {
      // Check if a cooldown is active
      if (user.usernameLastChanged) {
        const cooldownPeriod = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
        const timeSinceLastChange = Date.now() - user.usernameLastChanged.getTime();

        if (timeSinceLastChange < cooldownPeriod) {
          const nextChangeDate = new Date(user.usernameLastChanged.getTime() + cooldownPeriod);
          return res.status(403).json({ 
            message: `You can change your username again on ${nextChangeDate.toLocaleDateString()}.` 
          });
        }
      }
      // If change is allowed, update username and set the new timestamp
      user.username = username;
      user.usernameLastChanged = new Date();
    }

    // Update other fields
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;

    // Save all changes at once
    const updatedUser = await user.save();

    // Prepare response object
    const userObject = updatedUser.toObject();
    delete userObject.password;

    res.status(200).json({ message: "Profile updated successfully", user: userObject });

  } catch (err) {
    console.error("Error in editProfile:", err);
    if (err.code === 11000) { // Handle duplicate username error
        return res.status(400).json({ message: "That username is already taken." });
    }
    res.status(500).json({ message: "Failed to update profile: " + err.message });
  }
};

// Check if a username is available
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ available: false, message: 'Username is required.' });
    }
    // Check against current user to allow them to keep their own name
    const user = await User.findOne({ 
      username: { $regex: `^${username}$`, $options: 'i' }, // case-insensitive exact match
      _id: { $ne: req.user?.id } // Exclude the current user if they are logged in
    });

    if (user) {
      return res.status(200).json({ available: false, message: 'Username is already taken.' });
    }
    return res.status(200).json({ available: true, message: 'Username is available.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};