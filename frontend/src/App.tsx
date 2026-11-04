import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { ProblemLibraryPage } from './pages/ProblemLibraryPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string[] }> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 mb-6">
          You need elevated administrative privileges to view this area.
        </p>
        <a href="/" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold">
          Return Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/community" element={<CommunityFeedPage />} />
              <Route path="/community/questions/:id" element={<QuestionDetailPage />} />
              <Route path="/problems" element={<ProblemLibraryPage />} />
              <Route path="/problems/:id" element={<ProblemDetailPage />} />
              <Route path="/profile/:username" element={<UserProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Authenticated Routes */}
              <Route
                path="/ask"
                element={
                  <ProtectedRoute>
                    <AskQuestionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin & Moderation Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole={['admin', 'moderator']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="max-w-md mx-auto px-4 py-24 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
                    <p className="text-sm text-slate-500 mb-6">The page you requested does not exist.</p>
                    <a
                      href="/"
                      className="inline-flex px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold"
                    >
                      Return Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};
