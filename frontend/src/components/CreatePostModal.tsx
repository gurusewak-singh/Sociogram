// frontend/src/components/CreatePostModal.tsx
import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import api from '../services/api';
import { useAppSelector } from '../hooks/reduxHooks';
import { FaImage, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ModalProps {
  onClose: () => void;
  onPostCreated: (newPost: any) => void; // Callback to update the feed
}

const CreatePostModal: React.FC<ModalProps> = ({ onClose, onPostCreated }) => {
  const [textContent, setTextContent] = useState('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector(state => state.auth);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPostImageFile(null);
    setPreviewImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent && !postImageFile) {
      setError('Your post cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      if (postImageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', postImageFile);
        const uploadResponse = await api.post('/upload', uploadFormData);
        imageUrl = uploadResponse.data.imageUrl;
      }

      const postData = {
        textContent,
        image: imageUrl,
      };

      const response = await api.post('/posts', postData);
      onPostCreated(response.data.post); // Pass the new post back to the feed
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-lg"
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-200">
            <FaTimes />
          </button>
        </div>
        {error && <p className="text-error text-sm mb-4">{error}</p>}
        
        <div className="flex items-start gap-4">
          <img
            src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.username}`}
            alt="Your profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={`What's on your mind, ${user?.username}?`}
                className="w-full p-2 border-none focus:ring-0 text-lg resize-none"
                rows={4}
              />
              {previewImage && (
                <div className="mt-4 relative">
                  <img src={previewImage} alt="Post preview" className="w-full rounded-lg" />
                  <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full">
                    <FaTimes/>
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-primary-600 rounded-full hover:bg-primary-50"
                >
                  <FaImage size={24} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
                <button
                  type="submit"
                  disabled={loading || (!textContent && !postImageFile)}
                  className="px-6 py-2 rounded-full text-white font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;