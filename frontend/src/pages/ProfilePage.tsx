// frontend/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import MainLayout from '../layouts/MainLayout';
import EditProfileModal from '../components/EditProfileModal'; // <-- Import modal
import { setCredentials } from '../store/authSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>(); // Get user ID from the URL
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // <-- Modal state
  // --- ADD NEW STATE ---
  // We'll use this to track the friendship status with the viewed user
  const [friendshipStatus, setFriendshipStatus] = useState<'friends' | 'request_sent' | 'request_received' | 'not_friends' | 'self'>('not_friends');
  const [isProcessingFriendAction, setIsProcessingFriendAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the currently logged-in user from Redux
  const { user: currentUser, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This effect runs when the component mounts or the user ID in the URL changes.
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get<UserProfile>(`/users/profile/${id}`);
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load profile. The user may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    // This separate effect runs whenever the profile or current user data changes.
    // This ensures our status is always in sync.
    if (!profile || !currentUser) return;

    if (profile._id === currentUser._id) {
      setFriendshipStatus('self');
    } else if (currentUser.friends?.includes(profile._id)) {
      setFriendshipStatus('friends');
    } else if (profile.friendRequests?.includes(currentUser._id)) {
      // **THE KEY CHANGE**: Check if MY ID is in THEIR friend request list.
      // This is the source of truth that a request has been sent.
      setFriendshipStatus('request_sent');
    } else if (currentUser.friendRequests?.includes(profile._id)) {
      setFriendshipStatus('request_received');
    } else {
      setFriendshipStatus('not_friends');
    }
  }, [profile, currentUser]);

  // --- ACTION HANDLERS ---
  const handleSendFriendRequest = async () => {
    if (!profile) return;
    setIsProcessingFriendAction(true);
    try {
      // The backend adds our ID to the receiver's friendRequests array.
      await api.post(`/friend/friend-request/${profile._id}`);
      // To make the UI update instantly without a refresh, we can manually
      // update the profile state to reflect the change.
      setProfile(prevProfile => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          friendRequests: [...prevProfile.friendRequests, currentUser!._id]
        };
      });
    } catch (error: any) {
      console.error("Failed to send friend request", error);
      alert(error.response?.data?.message || 'Could not send request.');
    } finally {
      setIsProcessingFriendAction(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!profile) return;
    setIsProcessingFriendAction(true);
    try {
        await api.post(`/friend/friend-request/${profile._id}/accept`);
        // Refresh the current user's data to update their friend list
        const updatedUserResponse = await api.get(`/users/profile/${currentUser!._id}`);
        dispatch(setCredentials({ user: updatedUserResponse.data, token: token! }));
        setFriendshipStatus('friends'); // Manually update status for instant UI change
    } catch (error) {
        console.error("Failed to accept request", error);
        alert('Could not accept request.');
    } finally {
        setIsProcessingFriendAction(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!profile) return;
    setIsProcessingFriendAction(true);
    try {
        await api.post(`/friend/friend-request/${profile._id}/reject`);
        setFriendshipStatus('not_friends');
    } catch (error) {
        console.error("Failed to reject request", error);
        alert('Could not reject request.');
    } finally {
        setIsProcessingFriendAction(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!profile) return;
    setIsProcessingFriendAction(true);
    try {
        await api.delete(`/friend/friend-request/${profile._id}/cancel`);
        setFriendshipStatus('not_friends');
    } catch (error) {
        toast.error("Failed to cancel request.");
    } finally {
        setIsProcessingFriendAction(false);
    }
  };

  // --- UPDATE THE RENDERED BUTTON ---
  const renderFriendButton = () => {
    switch (friendshipStatus) {
      case 'self':
        return (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600"
          >
            Edit Profile
          </button>
        );
      case 'friends':
        return <button disabled className="px-4 py-2 bg-neutral-200 text-neutral-600 rounded-lg font-semibold">Friends</button>;
      case 'request_sent':
        return (
            <button onClick={handleCancelRequest} disabled={isProcessingFriendAction} className="px-4 py-2 bg-neutral-500 text-white rounded-lg font-semibold hover:bg-neutral-600">
                Cancel Request
            </button>
        );
      case 'request_received': // This user sent me a request
        return (
          <div className="flex gap-2">
            <button
              onClick={handleAcceptFriendRequest}
              disabled={isProcessingFriendAction}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold"
            >
              Accept
            </button>
            <button
              onClick={handleRejectFriendRequest}
              disabled={isProcessingFriendAction}
              className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg font-semibold"
            >
              Decline
            </button>
          </div>
        );
      case 'not_friends':
      default:
        return (
          <button
            onClick={handleSendFriendRequest}
            disabled={isProcessingFriendAction}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:bg-primary-300"
          >
            {isProcessingFriendAction ? 'Sending...' : 'Add Friend'}
          </button>
        );
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Conditionally render the modal */}
        {isEditModalOpen && (
          <EditProfileModal user={profile} onClose={() => setIsEditModalOpen(false)} />
        )}
        <div className="w-full">
          {/* Cover Banner */}
          <div className="h-48 md:h-64 bg-neutral-300 rounded-lg relative">
            {/* Placeholder for cover photo */}
          </div>

          {/* Profile Header */}
          <div className="container -mt-20 px-4">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center md:items-end gap-4">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={profile.profilePic || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
                  alt={`${profile.username}'s profile`}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">{profile.username}</h1>
                <p className="text-neutral-500 mt-1">{profile.bio || "No bio yet."}</p>
              </div>
              
              {/* Action Button */}
              <div className="mt-4 md:mt-0">
                {renderFriendButton()} {/* <-- Replace the old button logic with this function call */}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="container mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column (Stats) */}
              <div className="md:col-span-1">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-2">Stats</h3>
                  <div className="space-y-2 text-neutral-600">
                      <p><strong>Friends:</strong> {profile.friends.length}</p>
                      <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Right Column (Tabs & Posts) */}
              <div className="md:col-span-2">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  {/* Tabs */}
                  <div className="border-b border-neutral-200 mb-4">
                    <nav className="flex space-x-4">
                      <a href="#" className="py-2 px-1 border-b-2 border-primary-500 font-semibold text-primary-600">Posts</a>
                      <a href="#" className="py-2 px-1 border-b-2 border-transparent text-neutral-500 hover:border-neutral-300">Media</a>
                      <a href="#" className="py-2 px-1 border-b-2 border-transparent text-neutral-500 hover:border-neutral-300">Likes</a>
                    </nav>
                  </div>
                  {/* Tab Content */}
                  <div>
                      <p className="text-neutral-500">Posts will be displayed here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

// Define UserProfile interface locally
interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePic: string;
  friends: string[]; // This should be an array of friend IDs
  friendRequests: string[]; // The list of requests this user has received
  createdAt: string;
}

export default ProfilePage;