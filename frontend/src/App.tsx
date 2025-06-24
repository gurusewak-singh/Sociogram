// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import MessagesPage from './pages/MessagesPage';
import MessagesHubPage from './pages/MessagesHubPage'; // <-- Import
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage'; // <-- Import
import NotificationsPage from './pages/NotificationsPage'; // <-- Import
import { useAppSelector } from './hooks/reduxHooks';
import { Toaster } from 'react-hot-toast'; // <-- Import
import OnboardingModal from './components/OnboardingModal'; // <-- Import

function App() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <> {/* Use a fragment to wrap multiple top-level elements */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
      />
      {/* --- SHOW ONBOARDING MODAL IF NEEDED --- */}
      {isAuthenticated && user?.needsSetup && <OnboardingModal />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesHubPage />} /> {/* <-- Use the new hub page */}
          <Route path="/messages/:id" element={<MessagesPage />} /> {/* This one is for individual chats */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<NotificationsPage />} /> {/* <-- Add this */}
          <Route path="/settings" element={<SettingsPage />} /> {/* <-- Add route */}
          {/* We will need a PostDetailPage later */}
          {/* Add other protected routes here later, e.g., /settings */}
        </Route>
      </Routes>
    </>
  );
}

export default App;