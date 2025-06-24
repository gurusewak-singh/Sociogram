// backend/controllers/postController.js
const Post = require('../models/post');
const User = require('../models/user');
const Notification = require('../models/notification');
const { getSocketId } = require('../socketManager');

exports.createPost = async (req, res) => {
  try {
    const { textContent, image } = req.body;
    if (!textContent && !image) {
        return res.status(400).json({ message: "Post must have either text content or an image." });
    }
    const newPost = new Post({
      userId: req.user.id,
      textContent,
      image,
    });
    await newPost.save();
    const populatedPost = await Post.findById(newPost._id).populate('userId', 'username profilePic');
    res.status(201).json({ message: "Post created successfully", post: populatedPost });
  } catch (err) {
    console.error("Error in createPost:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
                          .populate('userId', 'username profilePic')
                          .populate('comments.userId', 'username profilePic')
                          .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getAllPosts:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        const post = await Post.findById(id)
                               .populate("userId", "username profilePic")
                               .populate("comments.userId", "username profilePic");
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (err) {
        console.error("Error in getPostById:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
                          .populate('userId', 'username profilePic')
                          .populate('comments.userId', 'username profilePic')
                          .sort({ createdAt: -1 });
    if (!posts) {
      return res.status(404).json({ message: "No posts found for this user or user does not exist." });
    }
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getPostsByUserId:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find all posts where the 'likes' array contains the userId
    const posts = await Post.find({ likes: userId })
      .populate('userId', 'username profilePic')
      .populate('comments.userId', 'username profilePic')
      .sort({ createdAt: -1 });
      
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getLikedPosts:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid post ID format" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error in deletePost:", err);
    res.status(500).json({ message: "Failed to delete post: " + err.message });
  }
};

exports.toggleLikePost = async (req, res) => {
  const io = req.app.get('socketio');
  try {
    const postToUpdate = await Post.findById(req.params.id);
    if (!postToUpdate) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userIdString = req.user.id.toString();
    const postOwnerIdString = postToUpdate.userId.toString();
    const likeIndex = postToUpdate.likes.findIndex(id => id.toString() === userIdString);
    let responseMessage = "";

    if (likeIndex > -1) {
      postToUpdate.likes.splice(likeIndex, 1);
      responseMessage = "Post unliked";
    } else {
      postToUpdate.likes.push(req.user.id);
      responseMessage = "Post liked";

      if (userIdString !== postOwnerIdString) {
        const senderUser = await User.findById(req.user.id).select('username');
        const senderUsername = senderUser ? senderUser.username : 'Someone';
        
        await new Notification({
          recipient: postToUpdate.userId,
          sender: req.user.id,
          type: 'like',
          entityId: postToUpdate._id,
        }).save();
        
        const postOwnerSocket = getSocketId(postOwnerIdString);
        if (postOwnerSocket) {
          io.to(postOwnerSocket).emit("new-notification", {
            message: `${senderUsername} liked your post.`,
          });
        }
      }
    }

    await postToUpdate.save();
    const populatedPost = await Post.findById(postToUpdate._id)
      .populate('userId', 'username profilePic')
      .populate('comments.userId', 'username profilePic');
    return res.status(200).json({ message: responseMessage, post: populatedPost });
  } catch (err) {
    console.error("!!! CRITICAL ERROR in toggleLikePost:", err);
    res.status(500).json({ message: "Failed to toggle like.", error: err.message });
  }
};

exports.addComment = async (req, res) => {
  const io = req.app.get('socketio');
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    post.comments.push({ userId: req.user.id, text: req.body.text });
    await post.save();
    
    if (req.user.id.toString() !== post.userId.toString()) {
      const commenter = await User.findById(req.user.id).select('username');
      const commenterUsername = commenter ? commenter.username : 'Someone';

      await new Notification({
        recipient: post.userId,
        sender: req.user.id,
        type: 'comment',
        entityId: post._id,
      }).save();

      const postOwnerSocket = getSocketId(post.userId.toString());
      if (postOwnerSocket) {
        io.to(postOwnerSocket).emit("new-notification", {
          message: `${commenterUsername} commented on your post.`,
        });
      }
    }
    
    const populatedPost = await Post.findById(post._id).populate('userId', 'username profilePic').populate('comments.userId', 'username profilePic');
    res.status(200).json({ message: "Comment added", post: populatedPost });
  } catch (err) {
    console.error("!!! CRITICAL ERROR in addComment:", err);
    res.status(500).json({ message: "Failed to add comment.", error: err.message });
  }
};