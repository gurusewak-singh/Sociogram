// frontend/src/components/OnboardingModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { setCredentials } from '../store/authSlice';
import useDebounce from '../hooks/useDebounce';
import api from '../services/api';
import toast from 'react-hot-toast';

const OnboardingModal = () => {
    const { user, token } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(1);

    // Step 1 State (Username)
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string } | null>(null);
    const debouncedUsername = useDebounce(username, 500);

    // Step 2 State (Profile Info)
    const [bio, setBio] = useState('');
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePic || null);

    const [isLoading, setIsLoading] = useState(false);

    // Username checking effect
    useEffect(() => {
        if (debouncedUsername.length < 3) {
            setUsernameStatus(null);
            return;
        }
        setIsChecking(true);
        api.get(`/users/check-username?username=${debouncedUsername}`)
            .then(res => setUsernameStatus(res.data))
            .finally(() => setIsChecking(false));
    }, [debouncedUsername]);

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            let profilePicUrl = user?.profilePic || '';
            if (profilePicFile) {
                const formData = new FormData();
                formData.append('image', profilePicFile);
                const res = await api.post('/upload', formData);
                profilePicUrl = res.data.imageUrl;
            }

            const finalUserData = {
                username: username || user?.username, // Use new username if provided
                bio,
                profilePic: profilePicUrl,
                needsSetup: false, // Mark setup as complete!
            };

            const response = await api.put('/users/edit', finalUserData);
            dispatch(setCredentials({ user: response.data.user, token: token! }));
            toast.success("Welcome to Sociogram!");
            // The modal will be closed by the parent component
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Determine initial step based on whether the user needs to set a username
    useEffect(() => {
        if(user?.username.startsWith('user_')) {
            setStep(1);
        } else {
            setStep(2);
        }
    }, [user]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-neutral-800 p-8 rounded-lg w-full max-w-md">
                {/* Step 1: Choose Username */}
                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">Welcome!</h2>
                        <p className="mb-6 text-neutral-600 dark:text-neutral-300">Let's set up your profile. First, choose a unique username.</p>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600" />
                        {isChecking && <p className="text-sm mt-2 text-neutral-500">Checking...</p>}
                        {usernameStatus && <p className={`text-sm mt-2 ${usernameStatus.available ? 'text-green-500' : 'text-red-500'}`}>{usernameStatus.message}</p>}
                        <button onClick={() => setStep(2)} disabled={!usernameStatus?.available} className="w-full mt-4 p-2 bg-primary-600 text-white rounded disabled:bg-primary-300">Next</button>
                    </div>
                )}
                {/* Step 2: Profile & Bio */}
                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Complete Your Profile</h2>
                        {/* Profile Pic Upload UI here (similar to EditProfileModal) */}
                        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full p-2 border rounded mt-4 dark:bg-neutral-700 dark:border-neutral-600" rows={3}></textarea>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={handleFinish} className="px-4 py-2 text-neutral-600 dark:text-neutral-300">Skip for now</button>
                            <button onClick={handleFinish} disabled={isLoading} className="px-4 py-2 bg-primary-600 text-white rounded disabled:bg-primary-300">{isLoading ? 'Saving...' : 'Finish'}</button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OnboardingModal;