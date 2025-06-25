import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAppSelector } from '../hooks/reduxHooks';
import { FaTimes } from 'react-icons/fa';

const FriendListPage = () => {
    const { id: profileId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAppSelector((state) => state.auth);

    const [friends, setFriends] = useState([]);
    const [profileUsername, setProfileUsername] = useState('');
    const [loading, setLoading] = useState(true);

    const isOwnProfile = profileId === currentUser?._id;

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                // We need to get the full user profile to get the populated friends list
                const response = await api.get(`/users/profile/${profileId}`);
                setFriends(response.data.friends);
                setProfileUsername(response.data.username);
            } catch (error) {
                console.error("Failed to fetch friends", error);
                toast.error("Could not load friend list.");
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [profileId]);

    const handleRemoveFriend = async (friendId) => {
        // Confirmation dialog
        if (!window.confirm("Are you sure you want to remove this friend?")) {
            return;
        }

        try {
            await api.delete(`/friend/${friendId}/remove`);
            // Update the UI instantly by filtering out the removed friend
            setFriends(prevFriends => prevFriends.filter(friend => friend._id !== friendId));
            toast.success("Friend removed.");
        } catch (error) {
            console.error("Failed to remove friend", error);
            toast.error("Could not remove friend.");
        }
    };

    if (loading) {
        return <MainLayout><div>Loading...</div></MainLayout>;
    }

    // --- ADDED THIS LOGGING ---
    console.log("Rendering friends list. Data:", friends);
    // --- END LOGGING ---

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h1 className="text-xl font-bold">
                            {isOwnProfile ? "Your Friends" : `${profileUsername}'s Friends`}
                        </h1>
                        <button onClick={() => navigate(`/profile/${profileId}`)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                           <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {friends.length > 0 ? (
                            friends.map((friend, index) => { // Add index for more robust key
                                // --- ADDED THIS LOGGING ---
                                console.log(`Mapping friend at index ${index}:`, friend);
                                // --- END LOGGING ---
                                return (
                                    <div key={friend._id || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                        <Link to={`/profile/${friend._id}`} className="flex items-center gap-3">
                                            <img 
                                                src={friend.profilePic || `https://ui-avatars.com/api/?name=${friend.username}`} 
                                                alt={friend.username}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <span className="font-semibold">{friend.username}</span>
                                        </Link>
                                        
                                        {isOwnProfile && (
                                            <button 
                                                onClick={() => handleRemoveFriend(friend._id)}
                                                className="px-3 py-1 border border-red-500/50 text-red-600 text-xs font-semibold rounded-md hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-neutral-500 py-4">No friends to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default FriendListPage;