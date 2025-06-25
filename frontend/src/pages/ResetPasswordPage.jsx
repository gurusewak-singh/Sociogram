//frontend/src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import { useAppDispatch } from '../hooks/reduxHooks';
import { setCredentials } from '../store/authSlice';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
            setError('Reset token is missing.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await api.put(`/auth/reset-password/${token}`, { password });
            setMessage('Password has been reset successfully! Redirecting to home...');
            
            // Log the user in and redirect
            dispatch(setCredentials(res.data));
            setTimeout(() => navigate('/'), 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
             <div>
                <h2 className="text-xl font-semibold text-center mb-4">Reset Your Password</h2>
                <p className="text-sm text-neutral-600 text-center mb-6">
                    Enter your new password below.
                </p>

                {message && <div className="bg-success/10 text-success p-3 rounded-md text-center mb-4">{message}</div>}
                {error && <div className="bg-error/10 text-error p-3 rounded-md text-center mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                        />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary-600 text-white rounded-md disabled:bg-primary-300">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
             </div>
        </AuthLayout>
    );
};

export default ResetPasswordPage;