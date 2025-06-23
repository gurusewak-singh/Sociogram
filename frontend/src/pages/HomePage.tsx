// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';
import { FaPlus } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { setPosts, addPost } from '../store/postSlice';
import type { PostType } from '../types';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { posts } = useAppSelector(state => state.posts);
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            // REMOVED THE GUARD CLAUSE AS REQUESTED
            try {
                setLoading(true);
                const response = await api.get('/posts/posts');
                dispatch(setPosts(response.data));
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [dispatch]); // REMOVED isAuthenticated FROM DEPENDENCIES AS REQUESTED

    const handlePostCreated = (newPost: PostType) => {
        dispatch(addPost(newPost));
    }

    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Floating "Create Post" Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-8 right-8 lg:right-[22rem] bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all z-40"
          >
            <FaPlus size={20} />
          </button>

          {/* Create Post Modal */}
          {isModalOpen && (
            <CreatePostModal 
              onClose={() => setIsModalOpen(false)} 
              onPostCreated={handlePostCreated}
            />
          )}

          {/* Main Feed Content */}
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <p>Loading posts...</p>
            ) : posts.length > 0 ? (
              posts.map(post => <Post key={post._id} post={post} />)
            ) : (
              <p>No posts yet. Be the first to share something!</p>
            )}
          </div>
        </motion.div>
      </MainLayout>
    );
};

export default HomePage;