import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/reduxHooks';

const OnboardingGuard = () => {
    const { user } = useAppSelector((state) => state.auth);

    // If user is loaded and needs setup, redirect to the onboarding page
    if (user && user.needsSetup) {
        return <Navigate to="/onboarding" replace />;
    }

    // Otherwise, the user is cleared to see the main app
    return <Outlet />;
};

export default OnboardingGuard;