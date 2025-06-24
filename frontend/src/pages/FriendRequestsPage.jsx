import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

const FriendRequestsPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get('/friend/friend-requests').then(res => setRequests(res.data));
  }, []);

  const handleRequest = async (senderId, action) => {
    try {
      await api.post(`/friend/friend-request/${senderId}/${action}`);
      // Remove the request from the list on success
      setRequests(prev => prev.filter(req => req._id !== senderId));
    } catch (error) {
      console.error(`Failed to ${action} friend request`, error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Friend Requests</h1>
        <div className="bg-white rounded-lg shadow-md p-4">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={req.profilePic || `https://ui-avatars.com/api/?name=${req.username}`} alt={req.username} className="w-12 h-12 rounded-full" />
                    <span className="font-semibold">{req.username}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequest(req._id, 'accept')} className="px-4 py-1 bg-primary-600 text-white rounded-lg">Accept</button>
                    <button onClick={() => handleRequest(req._id, 'reject')} className="px-4 py-1 bg-neutral-200 rounded-lg">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No new friend requests.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FriendRequestsPage;