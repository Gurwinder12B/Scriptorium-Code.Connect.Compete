import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">
                  SCRIPTORIUM
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
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
                    ? 'bg-slate-100 text-brand-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Community
              </Link>
              <Link
                to="/problems"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/problems')
                    ? 'bg-slate-100 text-brand-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-4 h-4 mr-2" />
                Problems
              </Link>
              <Link
                to="/leaderboard"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/leaderboard')
                    ? 'bg-slate-100 text-brand-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                      ? 'bg-slate-100 text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/notifications"
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{user?.username}</span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-100 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 uppercase tracking-wider">
                            {user?.role}
                          </span>
                          <span className="text-xs text-brand-600 font-semibold">
                            {user?.profile?.points || 0} pts
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 mr-2.5 text-slate-400" />
                        Public Profile
                      </Link>

                      {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium"
                        >
                          <Shield className="w-4 h-4 mr-2.5 text-purple-600" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
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
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <MessageSquare className="w-5 h-5 mr-3 text-slate-400" />
            Community
          </Link>
          <Link
            to="/problems"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <Code2 className="w-5 h-5 mr-3 text-slate-400" />
            Problems
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <Trophy className="w-5 h-5 mr-3 text-slate-400" />
            Leaderboard
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-slate-400" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
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
                className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
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
