//frontend/src/components/EditProfileModal.jsx
import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useAppDispatch } from '../hooks/reduxHooks';
import { setCredentials } from '../store/authSlice';
import { FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast'; // <-- IMPORT TOAST

const EditProfileModal = ({ user, onClose, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio,
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user.profilePic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // We can keep this for inline errors if needed
  const fileInputRef = useRef(null);
  const dispatch = useAppDispatch();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- START: TOAST IMPLEMENTATION ---
    const toastId = toast.loading('Saving profile...'); // Show loading toast

    try {
      let profilePicUrl = user.profilePic;

      if (profilePicFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', profilePicFile);
        
        const uploadResponse = await api.post('/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        profilePicUrl = uploadResponse.data.imageUrl;
      }

      const updateData = {
        ...formData,
        profilePic: profilePicUrl,
      };

      const response = await api.put('/users/edit', updateData);
      
      dispatch(setCredentials({ user: response.data.user, token: localStorage.getItem('token') }));
      onProfileUpdate(response.data.user);
      
      toast.success('Profile updated successfully!', { id: toastId }); // Update to success
      
      onClose();

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile.';
      setError(errorMessage); // Set inline error
      toast.error(errorMessage, { id: toastId }); // Update to error
    } finally {
      setLoading(false);
    }
    // --- END: TOAST IMPLEMENTATION ---
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {/* ... (The form JSX remains the same) ... */}
           <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src={previewImage || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 save-button text-white p-2 rounded-full hover:bg-primary-700"
              >
                <FaCamera />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="mt-1 w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;