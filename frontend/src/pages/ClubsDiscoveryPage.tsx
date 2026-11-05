import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Compass,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Megaphone,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { clubsApi } from '../services/api';
import { ClubItem, ClubAnnouncementItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const CLUB_CATEGORIES = [
  'All',
  'Open Source & Systems',
  'Competitive Programming',
  'AI & Machine Learning',
  'Web & Cloud',
  'Cybersecurity',
];

export const ClubsDiscoveryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('q') || '';
  const currentTab = searchParams.get('tab') || 'clubs'; // 'clubs' | 'feed'

  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [announcements, setAnnouncements] = useState<ClubAnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Create club modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Open Source & Systems');
  const [newSchedule, setNewSchedule] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [clubsData, feedData] = await Promise.all([
        clubsApi.getClubs({
          category: currentCategory !== 'All' ? currentCategory : undefined,
          q: currentSearch || undefined,
        }),
        clubsApi.getAnnouncementsFeed().catch(() => []),
      ]);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setAnnouncements(Array.isArray(feedData) ? feedData : []);
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCategory, currentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('q', searchInput.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleToggleJoin = async (clubId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in to join student technical clubs.');
      return;
    }
    try {
      const res = await clubsApi.toggleJoin(clubId);
      setClubs(prev =>
        prev.map(c =>
          c.id === clubId
            ? { ...c, user_is_member: res.user_is_member, member_count: res.member_count }
            : c
        )
      );
    } catch (err: any) {
      alert(err.message || 'Membership toggle failed');
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTagline.trim() || !newDesc.trim()) return;
    setSubmitting(true);
    try {
      await clubsApi.createClub({
        name: newName.trim(),
        tagline: newTagline.trim(),
        description_markdown: newDesc.trim(),
        category: newCategory,
        meeting_schedule: newSchedule.trim() || undefined,
        logo_url: newLogoUrl.trim() || undefined,
      });
      setIsCreateModalOpen(false);
      setNewName('');
      setNewTagline('');
      setNewDesc('');
      setNewSchedule('');
      setNewLogoUrl('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to establish club');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Campus Developer Communities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Technical Clubs & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300">
              Engineering Hubs
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Join student-led engineering societies, participate in weekly code clinics, prep for ACM ICPC, and attend hands-on AI & systems workshops.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in to establish a technical club.');
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Form a Technical Club</span>
            </Button>
            <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set('tab', 'clubs');
                  setSearchParams(p);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentTab === 'clubs' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Clubs Directory ({clubs.length})
              </button>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set('tab', 'feed');
                  setSearchParams(p);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentTab === 'feed' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Campus Notices ({announcements.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {currentTab === 'clubs' ? (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {CLUB_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentCategory === cat
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clubs by name, focus, or meeting schedule..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </form>
          </div>

          {/* Clubs Cards Grid */}
          {loading ? (
            <div className="py-24 flex justify-center">
              <LoadingSpinner size="lg" text="Loading technical clubs..." />
            </div>
          ) : clubs.length === 0 ? (
            <EmptyState
              title="No technical clubs found"
              description="Be the first student leader to establish a technical club on campus!"
              actionText="Form a Technical Club"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map(club => (
                <div
                  key={club.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-500/50 dark:hover:border-purple-500/50 transition duration-200 flex flex-col justify-between overflow-hidden p-6 space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center border border-purple-200 dark:border-purple-800 flex-shrink-0">
                        {club.logo_url ? (
                          <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>

                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {club.category}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/clubs/${club.slug || club.id}`}
                          className="text-lg font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition"
                        >
                          {club.name}
                        </Link>
                        {club.is_verified && (
                          <span title="Verified Campus Guild">
                            <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {club.tagline}
                      </p>
                    </div>

                    {/* Schedule Pill */}
                    {club.meeting_schedule && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        <span className="truncate">{club.meeting_schedule}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{club.member_count} Members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => handleToggleJoin(club.id, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          club.user_is_member
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {club.user_is_member ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Joined</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Join</span>
                          </>
                        )}
                      </button>

                      <Link to={`/clubs/${club.slug || club.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <span>Hub</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Campus Announcements Feed Tab */
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              All Campus Technical Announcements & Workshops
            </h2>
          </div>

          {announcements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No active announcements right now. Check back soon for upcoming hackathons and clinics!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-xs space-y-3 ${
                    ann.is_pinned
                      ? 'border-purple-300 dark:border-purple-800/80 ring-1 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        ann.announcement_type === 'WORKSHOP'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400'
                          : ann.announcement_type === 'RECRUITMENT'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-400'
                      }`}>
                        {ann.announcement_type}
                      </span>
                      {ann.is_pinned && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400">
                          📌 Pinned Notice
                        </span>
                      )}
                      <Link
                        to={`/clubs/${ann.club_slug || ann.club_id}`}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {ann.club_name}
                      </Link>
                    </div>

                    <span className="text-xs text-slate-400">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {ann.title}
                  </h3>

                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {ann.content_markdown}
                  </div>

                  {ann.rsvp_link && (
                    <div className="pt-2">
                      <a
                        href={ann.rsvp_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Register / RSVP for Session</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Form a Club */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Establish a Technical Club
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Cloud Society"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Mission Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exploring microservices, Docker, Kubernetes, and cloud patterns"
                  value={newTagline}
                  onChange={e => setNewTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    {CLUB_CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Every Friday at 5:00 PM, CS Lab 1"
                    value={newSchedule}
                    onChange={e => setNewSchedule(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Logo / Emblem URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newLogoUrl}
                  onChange={e => setNewLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Club Mission & Activities Description (Markdown) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your goals, activities, workshops planned, and leadership team..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                  {submitting ? 'Creating...' : 'Establish Club'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsDiscoveryPage;
