// backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken }  = require('../middlewares/authMiddleware');

router.post('/', verifyToken, postController.createPost); // Create a new post

router.get('/posts', verifyToken, postController.getAllPosts); // Get all posts

router.get('/:id', postController.getPostById); // Get a post by ID

// --- ADDED THE NEW ROUTE IN THE REQUESTED POSITION ---
router.get('/liked/:userId', verifyToken, postController.getLikedPosts);

router.get('/user/:userId', verifyToken, postController.getPostsByUserId);

router.delete('/:id', verifyToken, postController.deletePost); // Delete a post by ID

router.put('/:id/like', verifyToken, postController.toggleLikePost); // Like a post

router.post('/:id/comment', verifyToken, postController.addComment); // Add a comment to a post

module.exports = router;