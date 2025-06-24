// frontend/src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/reduxHooks';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';

const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

const LoginPage = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const { emailOrUsername, password } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!emailOrUsername || !password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        emailOrUsername,
        password,
      });

      const { token, user } = response.data;
      dispatch(setCredentials({ token, user }));
      navigate('/');

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-800 text-center mb-6">
        Login to Sociogram
      </h2>
      
      {successMessage && (
        <div className="bg-success/10 border border-success/30 text-success text-sm rounded-lg p-3 mb-4 text-center">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg p-3 mb-4 text-center">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="emailOrUsername" 
            className="block text-sm font-medium text-neutral-700"
          >
            Email or Username
          </label>
          <input
            type="text"
            id="emailOrUsername"
            name="emailOrUsername"
            value={emailOrUsername}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-neutral-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <div className="text-right text-sm mt-1">
            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot Password?
            </Link>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </div>
      </form>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-t border-neutral-300" />
        <span className="mx-4 text-neutral-500 text-sm">OR</span>
        <hr className="flex-grow border-t border-neutral-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-5 h-5" />
        <span className="text-neutral-700 font-semibold">Continue with Google</span>
      </button>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;