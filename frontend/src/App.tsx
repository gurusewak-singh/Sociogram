// frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingGuard from './components/OnboardingGuard';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import MessagesPage from './pages/MessagesPage';
import MessagesHubPage from './pages/MessagesHubPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import AccountPage from './pages/AccountPage';
import EditProfileSubPage from './pages/account/EditProfileSubPage';
import LikedPostsSubPage from './pages/account/LikedPostsSubPage';
import { useAppSelector } from './hooks/reduxHooks';
import { Toaster } from 'react-hot-toast';

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* Public Routes - No Change */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* --- NEW ROUTING LOGIC FOR PROTECTED AREA --- */}
        <Route element={<ProtectedRoute />}>
          {/* A dedicated route for onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* All other routes are now children of the OnboardingGuard */}
          <Route element={<OnboardingGuard />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesHubPage />} />
            <Route path="/messages/:id" element={<MessagesPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/account/*" element={<AccountPage />}>
              <Route index element={<Navigate to="edit" replace />} />
              <Route path="edit" element={<EditProfileSubPage />} />
              <Route path="liked" element={<LikedPostsSubPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;