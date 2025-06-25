import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { logOut } from '../store/authSlice';
import MainLayout from '../layouts/MainLayout';
import EditProfileModal from '../components/EditProfileModal';
import AnimatedHamburgerIcon from '../components/AnimatedHamburgerIcon';
import { FiGrid } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const PostGridItem = ({ post }) => {
    return (
        <Link to={`/post/${post._id}`} className="group relative aspect-square block w-full overflow-hidden rounded-md">
            <img 
                src={post.image || 'https://placehold.co/500x500/e2e8f0/e2e8f0'} 
                alt="Post content" 
                className="pointer-events-none object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        </Link>
    );
};

const ProfilePage = () => {
    const { id: profileId } = useParams();
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const menuRef = useRef(null);
    
    const isOwnProfile = profileId === currentUser?._id;

    // --- DEFINE THE HANDLER FUNCTION ---
    const handleProfileUpdate = (updatedUser) => {
        setProfile(updatedUser); // Update the local state of this page
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!profileId) return;
            setLoading(true);
            try {
                const [profileRes, postsRes] = await Promise.all([
                    api.get(`/users/profile/${profileId}`),
                    api.get(`/posts/user/${profileId}`)
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data);
            } catch (error) { toast.error("Could not load profile."); } 
            finally { setLoading(false); }
        };
        fetchProfileData();
    }, [profileId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/login');
        toast.success("You've been logged out.");
    };
    
    if (loading) return <MainLayout><div className="text-center p-10">Loading...</div></MainLayout>;
    if (!profile) return <MainLayout><div className="text-center p-10">User not found.</div></MainLayout>;

    return (
        <MainLayout>
            {/* --- PASS THE NEW PROP TO THE MODAL --- */}
            {isEditModalOpen && (
                <EditProfileModal 
                    user={profile} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onProfileUpdate={handleProfileUpdate} // Pass the handler
                />
            )}
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Profile Header */}
                <header className="flex flex-col md:flex-row items-center gap-4 md:gap-8 p-4">
                    <img
                        src={profile.profilePic || `https://ui-avatars.com/api/?name=${profile.username}`}
                        alt={`${profile.username}'s profile`}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col gap-4 flex-grow w-full">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <h1 className="text-2xl md:text-3xl font-light">{profile.username}</h1>
                            {isOwnProfile ? (
                                <>
                                    <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-1.5 border rounded-lg text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                        Edit Profile
                                    </button>
                                    <div className="relative ml-auto" ref={menuRef}>
                                        <AnimatedHamburgerIcon isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
                                        {isMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-md shadow-lg py-1 z-10 border dark:border-neutral-700">
                                                <Link to="/account/liked" className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">Liked Posts</Link>
                                                <button 
                                                    onClick={() => {
                                                        navigate('/account/edit');
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                >
                                                    Change Username
                                                </button>
                                                <button className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50" disabled>Change Password</button>
                                                <div className="my-1 border-t border-neutral-200 dark:border-neutral-700"></div>
                                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10">Log Out</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <button className="px-4 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-semibold">
                                    Add Friend
                                </button>
                            )}
                        </div>
                        
                        <div className="flex justify-center md:justify-start items-center gap-6">
                            <div><span className="font-semibold">{posts.length}</span> posts</div>
                            <Link to={`/profile/${profileId}/friends`} className="hover:underline">
                                <span className="font-semibold">{profile.friends.length}</span> friends
                            </Link>
                        </div>

                        <div className="text-center md:text-left">
                            <p>{profile.bio || "No bio yet."}</p>
                        </div>
                    </div>
                </header>

                {/* Content Area with Posts Header */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8">
                    {/* Added Header */}
                    <div className="flex justify-center text-sm font-semibold">
                        <div className="flex items-center gap-2 py-3 border-t-2 border-neutral-800 dark:border-neutral-200 text-neutral-800 dark:text-neutral-200">
                            <FiGrid /> POSTS
                        </div>
                    </div>
                    {/* End of Added Header */}

                    <div className="mt-4">
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                {posts.map(post => <PostGridItem key={post._id} post={post} />)}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-neutral-500">
                                <div className="w-16 h-16 border-2 rounded-full flex items-center justify-center mx-auto">
                                   <FiGrid size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mt-4">No Posts Yet</h3>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </MainLayout>
    );
};

export default ProfilePage;