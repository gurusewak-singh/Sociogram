import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import TimeAgo from './TimeAgo';
import { useAppDispatch } from '../hooks/reduxHooks';
import { markAsRead, removeNotification } from '../store/notificationSlice';

const NotificationItem = ({ notification, closeDropdown }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleAccept = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/friend/friend-request/${notification.sender._id}/accept`);
      toast.success('Friend request accepted!');
      dispatch(removeNotification(notification._id));
    } catch (error) {
      toast.error('Failed to accept request.');
    }
  };

  const handleDecline = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/friend/friend-request/${notification.sender._id}/reject`);
      toast.success('Friend request declined.');
      dispatch(removeNotification(notification._id));
    } catch (error) {
      toast.error('Failed to decline request.');
    }
  };

  const getNotificationLink = () => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        return `/post/${notification.entityId}`;
      case 'friend_request':
        return `/profile/${notification.sender._id}`;
      default:
        return '#';
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'like': return 'liked your post.';
      case 'comment': return 'commented on your post.';
      case 'friend_request': return 'sent you a friend request.';
      default: return 'sent you a notification.';
    }
  };

  const handleNotificationClick = async () => {
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }
    
    if ((notification.type === 'like' || notification.type === 'comment') && !notification.read) {
        api.put(`/notifications/${notification._id}/read`);
    }
    
    closeDropdown();
    navigate(getNotificationLink());
  };

  return (
    <div
      onClick={handleNotificationClick}
      className={`p-3 border-b border-neutral-200 last:border-b-0 hover:bg-neutral-100 cursor-pointer ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
    >
      <div className="flex items-center gap-3">
        <img
          src={notification.sender.profilePic || `https://ui-avatars.com/api/?name=${notification.sender.username}`}
          alt={notification.sender.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm text-neutral-800">
            <span className="font-bold">{notification.sender.username}</span> {getMessage()}
          </p>
          <TimeAgo timestamp={notification.createdAt} />
        </div>
      </div>
      {notification.type === 'friend_request' && !notification.read && (
        <div className="mt-2 flex gap-2 justify-end">
          <button 
            onClick={handleAccept} 
            className="px-3 py-1 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Accept
          </button>
          <button 
            onClick={handleDecline} 
            className="px-3 py-1 text-xs bg-neutral-200 rounded-md hover:bg-neutral-300"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;