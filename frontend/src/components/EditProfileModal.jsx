import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useAppDispatch } from '../hooks/reduxHooks';
import { setCredentials } from '../store/authSlice';
import { FaCamera } from 'react-icons/fa';

const EditProfileModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio,
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user.profilePic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

    try {
      let profilePicUrl = user.profilePic;

      // 1. If a new file is selected, upload it
      if (profilePicFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', profilePicFile);
        
        const uploadResponse = await api.post('/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        profilePicUrl = uploadResponse.data.imageUrl;
      }

      // 2. Submit all data to the edit profile endpoint
      const updateData = {
        ...formData,
        profilePic: profilePicUrl,
      };

      const response = await api.put('/users/edit', updateData);
      
      // 3. Update Redux store with the new user data
      dispatch(setCredentials({ user: response.data.user, token: localStorage.getItem('token') }));
      
      onClose(); // Close the modal on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit}>
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
                className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600"
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