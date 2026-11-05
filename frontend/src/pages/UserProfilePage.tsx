import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi, blogsApi } from '../services/api';
import { BlogPostItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import {
  User as UserIcon,
  Trophy,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  MapPin,
  Github,
  Globe,
  Edit2,
  Calendar,
  BookOpen,
  Clock,
  Heart,
  Award,
  Zap,
  FolderGit2,
  ShieldCheck,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [userBlogs, setUserBlogs] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      try {
        const [data, blogsRes] = await Promise.all([
          usersApi.getProfile(username),
          blogsApi.getBlogs({ author: username, status: 'PUBLISHED' }).catch(() => ({ data: { items: [] } }))
        ]);
        setProfileData(data);
        setUserBlogs(blogsRes.data?.items || []);
        const p = data.profile || {};
        setFullName(p.full_name || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setGithubUrl(p.github_url || '');
        setWebsiteUrl(p.website_url || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile({
        full_name: fullName,
        bio,
        location,
        github_url: githubUrl,
        website_url: websiteUrl,
      });
      setProfileData(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading developer profile..." />;
  if (error || !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">User Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || 'This user does not exist.'}</p>
        <Link to="/community" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold">
          Explore Discussions
        </Link>
      </div>
    );
  }

  const p = profileData.profile || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-md shadow-brand-500/20">
            {profileData.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {p.full_name || profileData.username}
              </h1>
              <Badge variant="purple" size="sm">
                {profileData.role}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">@{profileData.username}</p>
            {p.location && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {p.location}
              </p>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        )}
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Update Profile Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Bio & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">About</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {p.bio || 'This user has not written a biography yet.'}
          </p>

          {/* Published Technical Articles */}
          {userBlogs && userBlogs.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  Published Technical Articles ({userBlogs.length})
                </h3>
              </div>
              <div className="space-y-3">
                {userBlogs.map((b) => (
                  <Link
                    key={b.id}
                    to={`/blogs/${b.slug || b.id}`}
                    className="block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {b.category?.name || 'Technical Article'}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {b.reading_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {b.like_count}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                      {b.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Questions */}
          {profileData.recent_questions && profileData.recent_questions.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                Recent Questions Asked
              </h3>
              <div className="space-y-2">
                {profileData.recent_questions.map((q: any) => (
                  <Link
                    key={q.id}
                    to={`/community/questions/${q.id}`}
                    className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {q.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Contribution Stats</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Points</span>
              <span className="font-bold text-slate-900 dark:text-white">{p.points || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Problems Solved</span>
              <span className="font-bold text-slate-900 dark:text-white">{p.problems_solved_count || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Questions Asked</span>
              <span className="font-bold text-slate-900 dark:text-white">{p.questions_count || 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Answers Contributed</span>
              <span className="font-bold text-slate-900 dark:text-white">{p.answers_count || 0}</span>
            </div>
          </div>

          {/* Genuine Verified Badges & Recognitions */}
          {profileData.badges && profileData.badges.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Verified Badges ({profileData.badges.length})
              </h3>
              <div className="space-y-2">
                {profileData.badges.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        {b.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400">
                        {b.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {b.description}
                    </p>
                    <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5">
                      ✓ {b.metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

