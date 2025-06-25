//frontend/src/pages/MessagesHubPage.jsx
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MessagesHubPage = () => {
    const [friends, setFriends] = useState([]);
    
    useEffect(() => {
        api.get('/friend/friends').then(res => setFriends(res.data));
    }, []);

    return (
        <MainLayout>
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-4 dark:text-white">Messages</h1>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-3 dark:text-neutral-200">Your Conversations</h2>
                    <div className="flex flex-col gap-2">
                        {friends.map(friend => (
                            <Link to={`/messages/${friend._id}`} key={friend._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                <img
                                    src={friend.profilePic || `https://ui-avatars.com/api/?name=${friend.username}`}
                                    alt={friend.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">{friend.username}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MessagesHubPage;