import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ConfirmPasswordPage from '@/pages/auth/ConfirmPasswordPage';
import EmailConfirmPage from '@/pages/auth/EmailConfirmPage';
import TwoFactorPage from '@/pages/auth/TwoFactorPage';
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage';

// Main Pages
import HomePage from '@/pages/HomePage';
import GamePage from '@/pages/GamePage';
import ChatPage from '@/pages/ChatPage';
import TournamentPage from '@/pages/TournamentPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Route Guards
import ProtectedRoute from '@/components/common/ProtectedRoute';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />
        } />
        <Route path="/signup" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <SignupPage />
        } />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/confirm-password" element={<ConfirmPasswordPage />} />
        <Route path="/confirm-email" element={<EmailConfirmPage />} />
        <Route path="/two-factor" element={<TwoFactorPage />} />
        <Route path="/oauth" element={<OAuthCallbackPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tournament" element={<TournamentPage />} />
        <Route path="/profile/:username?" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>

      {/* Redirects & Fallback */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
