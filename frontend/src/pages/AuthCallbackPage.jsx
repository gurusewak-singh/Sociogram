//frontend/src/pages/AuthCallbackPage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userString = params.get('user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        // Dispatch the action to save credentials to Redux store and localStorage
        dispatch(setCredentials({ user, token }));
        // Redirect to the home page after successful login
        navigate('/');
      } catch (error) {
        console.error("Failed to parse user data", error);
        navigate('/login'); // Redirect to login on error
      }
    } else {
      // Handle case where token or user is missing
      navigate('/login');
    }
  }, [dispatch, location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p> {/* Or a spinner component */}
    </div>
  );
};

export default AuthCallbackPage;