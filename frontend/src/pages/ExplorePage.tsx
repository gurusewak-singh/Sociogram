// frontend/src/pages/ExplorePage.tsx
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import type { PostType } from '../types'; // Changed to type-only import
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ExplorePage = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // We reuse the same endpoint as the feed for simplicity
        const response = await api.get('/posts/posts');
        // Shuffle the posts for a more "random" explore feel
        setPosts(response.data.sort(() => 0.5 - Math.random()));
      } catch (error) {
        console.error("Failed to fetch posts for explore page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-neutral-800 mb-6">Explore</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map(post => (
                <Link to={`/post/${post._id}`} key={post._id} className="group relative">
                  {post.image ? (
                    <img src={post.image} alt="Explore post" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 bg-neutral-200 rounded-lg">
                      <p className="text-neutral-600 text-center">{post.textContent.substring(0, 100)}...</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      {/* You can add like/comment counts here on hover */}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ExplorePage;