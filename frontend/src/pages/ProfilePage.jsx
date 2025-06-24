import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAppSelector } from '../hooks/reduxHooks';
import MainLayout from '../layouts/MainLayout';
import EditProfileModal from '../components/EditProfileModal';
import { FiGrid, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// A smaller component for the post grid
const PostGridItem = ({ post }) => {
    return (
        <Link to={`/post/${post._id}`} className="group relative aspect-square block w-full overflow-hidden rounded-lg">
            <img 
                src={post.image || 'https://via.placeholder.com/500'} 
                alt="Post" 
                className="pointer-events-none object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        </Link>
    );
};


const ProfilePage = () => {
    const { id: profileId } = useParams();
    const { user: currentUser } = useAppSelector((state) => state.auth);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const isOwnProfile = profileId === currentUser?._id;

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!profileId) return;
            setLoading(true);
            setActiveTab('posts'); // Reset to posts tab on profile change
            try {
                // Fetch profile details and user's own posts in parallel
                const [profileRes, postsRes] = await Promise.all([
                    api.get(`/users/profile/${profileId}`),
                    api.get(`/posts/user/${profileId}`)
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data);

            } catch (error) {
                console.error("Failed to load profile data", error);
                toast.error("Could not load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [profileId]);

    const handleFetchLikedPosts = async () => {
        if (!isOwnProfile) return;
        setActiveTab('liked');
        // Only fetch if we haven't fetched them before
        if (likedPosts.length === 0) {
            try {
                const res = await api.get(`/posts/liked/${currentUser?._id}`);
                setLikedPosts(res.data);
            } catch (error) {
                console.error("Failed to fetch liked posts", error);
                toast.error("Could not load liked posts.");
            }
        }
    };
    
    if (loading) {
        return <MainLayout><div className="text-center p-10">Loading profile...</div></MainLayout>;
    }

    if (!profile) {
        return <MainLayout><div className="text-center p-10 text-error">User not found.</div></MainLayout>;
    }

    return (
        <MainLayout>
            {isEditModalOpen && <EditProfileModal user={profile} onClose={() => setIsEditModalOpen(false)} />}
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                {/* --- Profile Header --- */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 p-4">
                    <img
                        src={profile.profilePic || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
                        alt={`${profile.username}'s profile`}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col gap-3 flex-grow w-full">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <h1 className="text-2xl md:text-3xl font-light text-neutral-800 dark:text-neutral-100">{profile.username}</h1>
                            {isOwnProfile ? (
                                <Link to="/account/edit" className="px-4 py-1.5 border rounded-lg text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                    Edit Profile
                                </Link>
                            ) : (
                                <button className="px-4 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600">
                                    Add Friend
                                </button>
                            )}
                        </div>
                        {/* --- Integrated Stats --- */}
                        <div className="flex justify-center md:justify-start items-center gap-6 text-neutral-800 dark:text-neutral-200">
                            <div><span className="font-semibold">{posts.length}</span> posts</div>
                            <div><span className="font-semibold">{profile.friends.length}</span> friends</div>
                        </div>

                        <div className="text-center md:text-left">
                            <p className="text-neutral-600 dark:text-neutral-300">{profile.bio || "No bio yet."}</p>
                        </div>
                    </div>
                </div>

                {/* --- Tab Navigation --- */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8">
                    <div className="flex justify-center gap-12 text-sm font-semibold">
                        <button 
                            onClick={() => setActiveTab('posts')}
                            className={`flex items-center gap-2 py-3 border-t-2 ${activeTab === 'posts' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500'}`}
                        >
                            <FiGrid /> POSTS
                        </button>
                        {isOwnProfile && (
                             <button 
                                onClick={handleFetchLikedPosts}
                                className={`flex items-center gap-2 py-3 border-t-2 ${activeTab === 'liked' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500'}`}
                             >
                                <FiHeart /> LIKED
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Tab Content: Posts Grid --- */}
                <div className="mt-6">
                    {activeTab === 'posts' && (
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {posts.map(post => <PostGridItem key={post._id} post={post} />)}
                        </div>
                    )}
                     {activeTab === 'liked' && (
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {likedPosts.map(post => <PostGridItem key={post._id} post={post} />)}
                        </div>
                    )}
                    {activeTab === 'posts' && posts.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                            <h3 className="text-2xl font-bold">No Posts Yet</h3>
                        </div>
                    )}
                </div>
            </motion.div>
        </MainLayout>
    );
};

export default ProfilePage;