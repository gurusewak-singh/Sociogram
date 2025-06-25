//frontend/src/components/Post.jsx
import React, { useState } from 'react';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updatePost } from '../store/postSlice';
import api from '../services/api';

const Post = ({ post }) => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector(state => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  const isLiked = post.likes.includes(currentUser?._id);

  const handleToggleLike = async () => {
    if (!currentUser) return;
    try {
      const updatedPost = {
        ...post,
        likes: isLiked 
          ? post.likes.filter(id => id !== currentUser._id)
          : [...post.likes, currentUser._id]
      };
      dispatch(updatePost(updatedPost));
      const response = await api.put(`/posts/${post._id}/like`);
      dispatch(updatePost(response.data.post));
    } catch (error) {
      console.error("Failed to toggle like:", error);
      dispatch(updatePost(post)); 
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      const response = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      dispatch(updatePost(response.data.post));
      setCommentText('');
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4 mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.userId.profilePic || `https://ui-avatars.com/api/?name=${post.userId.username}&background=random`}
            alt={post.userId.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-100">{post.userId.username}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <button className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      {post.textContent && <p className="text-neutral-700 dark:text-neutral-300 mb-4">{post.textContent}</p>}
      {/* Post Image */}
      {post.image && (
        <div className="mb-4">
          <img src={post.image} alt="Post content" className="w-full h-auto rounded-lg" />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 border-t border-b border-neutral-200 dark:border-neutral-700 py-2">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 ${isLiked ? 'text-red-500' : ''}`}
        >
          <FaHeart />
          <span>{post.likes.length} Likes</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <FaComment />
          <span>{post.comments.length} Comments</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <FaShare />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-4">
            <img 
              src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${currentUser?.username}`}
              alt="your avatar"
              className="w-8 h-8 rounded-full"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-full focus:outline-none"
            />
            <button type="submit" disabled={isCommenting} className="text-primary-600 font-semibold disabled:text-neutral-400">Post</button>
          </form>
          {/* Display Existing Comments */}
          <div className="space-y-3">
            {post.comments.slice(0).reverse().map(comment => ( // Show newest first
              <div key={comment._id} className="flex items-start gap-2">
                 <img 
                  src={comment.userId.profilePic || `https://ui-avatars.com/api/?name=${comment.userId.username}`}
                  alt={comment.userId.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="bg-neutral-100 dark:bg-neutral-700 p-2 rounded-lg">
                  <p className="font-semibold text-sm">{comment.userId.username}</p>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;