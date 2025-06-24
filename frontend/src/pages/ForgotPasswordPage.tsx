import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../layouts/AuthLayout';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div>
                <h2 className="text-xl font-semibold text-center mb-4">Forgot Password</h2>
                <p className="text-sm text-neutral-600 text-center mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {message && <div className="bg-success/10 text-success p-3 rounded-md text-center mb-4">{message}</div>}
                {error && <div className="bg-error/10 text-error p-3 rounded-md text-center mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary-600 text-white rounded-md disabled:bg-primary-300">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm">
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Back to Login
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;