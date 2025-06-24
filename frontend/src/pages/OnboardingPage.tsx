import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { setCredentials } from '../store/authSlice';
import useDebounce from '../hooks/useDebounce';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = () => {
    const { user, token } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [step, setStep] = useState(user?.username.startsWith('user_') ? 1 : 2);

    // Step 1 State
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string } | null>(null);
    const debouncedUsername = useDebounce(username, 500);

    // Step 2 State
    const [bio, setBio] = useState('');
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePic || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    // New effect to handle redirection
    useEffect(() => {
        if (user && !user.needsSetup) {
            console.log("User setup is complete, navigating to /");
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (debouncedUsername.length < 3) {
            setUsernameStatus(null);
            return;
        }
        setIsChecking(true);
        api.get(`/users/check-username?username=${debouncedUsername}`)
            .then(res => setUsernameStatus(res.data))
            .catch(() => setUsernameStatus({ available: false, message: 'Error checking username.' }))
            .finally(() => setIsChecking(false));
    }, [debouncedUsername]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

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
                username: (step === 1 && username) ? username : user?.username,
                bio,
                profilePic: profilePicUrl,
                needsSetup: false,
            };

            const response = await api.put('/users/edit', finalUserData);
            dispatch(setCredentials({ user: response.data.user, token: token! }));
            toast.success("Welcome to Sociogram!");
        } catch (error) {
            console.error('Onboarding failed:', error);
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col justify-center items-center p-4">
            <h1 className="text-3xl font-bold text-primary-600 mb-8">Sociogram</h1>
            <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} 
                animate={{ scale: 1, y: 0, opacity: 1 }} 
                className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl w-full max-w-md"
            >
                {/* Step 1: Choose Username */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-2xl font-bold mb-2">Welcome! One last step.</h2>
                        <p className="mb-6 text-neutral-600">Choose a unique username to get started.</p>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} 
                            placeholder="Choose a username" 
                            className="w-full p-2 border rounded" 
                        />
                        {isChecking && <p className="text-sm mt-2 text-neutral-500">Checking...</p>}
                        {usernameStatus && <p className={`text-sm mt-2 ${usernameStatus.available ? 'text-green-500' : 'text-red-500'}`}>{usernameStatus.message}</p>}
                        <button 
                            onClick={() => setStep(2)} 
                            disabled={!usernameStatus?.available || username.length < 3} 
                            className="w-full mt-4 p-3 bg-primary-600 text-white rounded font-semibold disabled:bg-primary-300"
                        >
                            Next
                        </button>
                    </motion.div>
                )}
                {/* Step 2: Profile & Bio */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                        <p className="mb-6 text-neutral-600">This helps others recognize you. You can skip for now.</p>
                        
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <img src={previewImage || `https://ui-avatars.com/api/?name=${username || user?.username}&background=random`} alt="Profile Preview" className="w-28 h-28 rounded-full object-cover border-4 border-neutral-200"/>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-transform hover:scale-110">
                                    <FaCamera />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                            </div>
                        </div>

                        <label htmlFor="bio" className="font-semibold text-neutral-700">Your Bio</label>
                        <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full p-2 border rounded mt-2" rows={3}></textarea>
                        
                        <div className="flex justify-end items-center gap-4 mt-8">
                            <button onClick={handleFinish} className="px-4 py-2 text-neutral-600 font-semibold rounded-md hover:bg-neutral-100">
                                Skip
                            </button>
                            <button onClick={handleFinish} disabled={isLoading} className="px-6 py-3 bg-primary-600 text-white rounded-md font-semibold disabled:bg-primary-300">
                                {isLoading ? 'Saving...' : 'Finish & Enter'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default OnboardingPage;