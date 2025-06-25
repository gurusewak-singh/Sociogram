//frontend/src/pages/account/EditProfileSubPage.jsx
import React, { useState, useRef, useMemo } from 'react';
import api from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { setCredentials } from '../../store/authSlice';
import toast from 'react-hot-toast';
import clsx from 'clsx'; // <-- Make sure to import it

const EditProfileSubPage = () => {
    const { user, token } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
    });
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(user?.profilePic || null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // --- NEW COOLDOWN CALCULATION LOGIC ---
    const cooldownInfo = useMemo(() => {
        if (!user?.usernameLastChanged) {
            return { active: false, message: null };
        }
        
        const cooldownPeriod = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
        const lastChangeTime = new Date(user.usernameLastChanged).getTime();
        const nextChangeTime = lastChangeTime + cooldownPeriod;
        
        const now = Date.now();

        if (now < nextChangeTime) {
            const msRemaining = nextChangeTime - now;
            // Calculate days remaining, rounding up to the nearest whole day
            const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
            
            return {
                active: true,
                message: `You can change your username again in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`
            };
        }
        
        return { active: false, message: null };
    }, [user?.usernameLastChanged]);

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
        const toastId = toast.loading('Saving profile...');

        try {
            let profilePicUrl = user?.profilePic || '';
            if (profilePicFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', profilePicFile);
                const uploadResponse = await api.post('/upload', uploadFormData);
                profilePicUrl = uploadResponse.data.imageUrl;
            }

            const updateData = { ...formData, profilePic: profilePicUrl };
            const response = await api.put('/users/edit', updateData);
            
            dispatch(setCredentials({ user: response.data.user, token: token }));
            toast.success('Profile updated successfully!', { id: toastId });
        } catch (err) {
            // --- NEW ERROR HANDLING for 403 Forbidden ---
            if (err.response && err.response.status === 403) {
                 toast.error(err.response.data.message, { id: toastId });
            } else {
                 toast.error(err.response?.data?.message || 'Failed to update profile.', { id: toastId });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Loading user data...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold dark:text-white mb-6">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-6">
                    <img src={previewImage || `https://ui-avatars.com/api/?name=${user.username}`} alt="Preview" className="w-24 h-24 rounded-full object-cover"/>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg">
                        Change Photo
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium dark:text-neutral-300">Username</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        disabled={cooldownInfo.active}
                        className="mt-1 w-full p-2 border border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600 rounded-md disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed" 
                    />
                    {/* --- DISPLAY COOLDOWN MESSAGE --- */}
                    {cooldownInfo.message && (
                        <p className="text-xs text-neutral-500 mt-1">{cooldownInfo.message}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium dark:text-neutral-300">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="mt-1 w-full p-2 border border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600 rounded-md"></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="px-6 py-2 save-button text-white rounded-lg disabled:bg-primary-300">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileSubPage;