// frontend/src/pages/account/LikedPostsSubPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Post from '../../components/Post';
import { useAppSelector } from '../../hooks/reduxHooks';
import type { PostType } from '../../types';

const LikedPostsSubPage = () => {
    const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        api.get<PostType[]>(`/posts/liked/${user._id}`)
            .then(res => setLikedPosts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div>
            <h2 className="text-2xl font-bold dark:text-white mb-6">Liked Posts</h2>
            <div className="space-y-6">
                {loading ? (
                    <p className="dark:text-neutral-300">Loading...</p>
                ) : likedPosts.length > 0 ? (
                    likedPosts.map(post => <Post key={post._id} post={post} />)
                ) : (
                    <p className="text-center py-4 text-neutral-500">You haven't liked any posts yet.</p>
                )}
            </div>
        </div>
    );
};

export default LikedPostsSubPage;