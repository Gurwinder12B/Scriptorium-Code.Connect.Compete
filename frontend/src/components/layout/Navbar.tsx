import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Code2,
  MessageSquare,
  Trophy,
  LayoutDashboard,
  Shield,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sun,
  Moon,
  Camera,
  BookOpen,
  CalendarDays,
  FolderGit2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  SCRIPTORIUM
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase">
                  Code. Connect. Compete.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-1">
              <Link
                to="/community"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/community')
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Community
              </Link>
              <Link
                to="/problems"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/problems')
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="w-4 h-4 mr-2" />
                Problems
              </Link>
              <Link
                to="/events"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/events')
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Camera className="w-4 h-4 mr-2" />
                Event Media
              </Link>
              <Link
                to="/blogs"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/blogs')
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Blogs
              </Link>
              <Link
                to="/projects"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/projects')
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <FolderGit2 className="w-4 h-4 mr-2" />
                Showcase
              </Link>
              <Link
                to="/leaderboard"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/leaderboard')
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/dashboard')
                      ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/notifications"
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-sm border border-brand-200 dark:border-brand-700">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {user?.username}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {user?.email}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            {user?.role}
                          </span>
                          <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                            {user?.profile?.points || 0} pts
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <UserIcon className="w-4 h-4 mr-2.5 text-slate-400" />
                        Public Profile
                      </Link>

                      {(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'editor') && (
                        <Link
                          to="/blogs/editorial"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium"
                        >
                          <CalendarDays className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                          Editorial Desk
                        </Link>
                      )}

                      {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-medium"
                        >
                          <Shield className="w-4 h-4 mr-2.5 text-purple-600 dark:text-purple-400" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-t border-slate-100 dark:border-slate-800 mt-1"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MessageSquare className="w-5 h-5 mr-3 text-slate-400" />
            Community
          </Link>
          <Link
            to="/problems"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Code2 className="w-5 h-5 mr-3 text-slate-400" />
            Problems
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Camera className="w-5 h-5 mr-3 text-slate-400" />
            Event Media
          </Link>
          <Link
            to="/blogs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <BookOpen className="w-5 h-5 mr-3 text-slate-400" />
            Blogs
          </Link>
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FolderGit2 className="w-5 h-5 mr-3 text-slate-400" />
            Showcase
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trophy className="w-5 h-5 mr-3 text-slate-400" />
            Leaderboard
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-slate-400" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-white bg-brand-600 rounded-lg"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
