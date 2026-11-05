import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Clock,
  MapPin,
  Megaphone,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Calendar,
  AlertCircle,
  Pin
} from 'lucide-react';
import { clubsApi } from '../services/api';
import { ClubItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ClubDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [club, setClub] = useState<ClubItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Announcement modal state
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [submittingAnn, setSubmittingAnn] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'WORKSHOP' | 'HACKATHON_CALL' | 'RECRUITMENT' | 'GENERAL'>('WORKSHOP');
  const [annPinned, setAnnPinned] = useState(false);
  const [annRsvp, setAnnRsvp] = useState('');

  const fetchClub = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await clubsApi.getClub(id);
      setClub(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load club details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [id]);

  const handleToggleJoin = async () => {
    if (!club) return;
    if (!isAuthenticated) {
      alert('Please sign in to join student technical clubs.');
      return;
    }
    try {
      const res = await clubsApi.toggleJoin(club.id);
      setClub(prev =>
        prev
          ? { ...prev, user_is_member: res.user_is_member, member_count: res.member_count }
          : null
      );
    } catch (err: any) {
      alert(err.message || 'Membership toggle failed');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club || !annTitle.trim() || !annContent.trim()) return;
    setSubmittingAnn(true);
    try {
      await clubsApi.createAnnouncement(club.id, {
        title: annTitle.trim(),
        content_markdown: annContent.trim(),
        announcement_type: annType,
        is_pinned: annPinned,
        rsvp_link: annRsvp.trim() || undefined,
      });

      setIsAnnModalOpen(false);
      setAnnTitle('');
      setAnnContent('');
      setAnnType('WORKSHOP');
      setAnnPinned(false);
      setAnnRsvp('');

      await fetchClub();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setSubmittingAnn(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <LoadingSpinner size="lg" text="Loading technical club hub..." />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Club Not Found</h2>
        <p className="text-slate-500 text-sm">{error || "The club you requested doesn't exist."}</p>
        <Link to="/clubs">
          <Button className="mt-4">Back to Clubs Directory</Button>
        </Link>
      </div>
    );
  }

  const isOfficerOrLead =
    club.user_role === 'LEAD' ||
    club.user_role === 'OFFICER' ||
    (user && (user.role === 'admin' || user.role === 'moderator'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/clubs" className="hover:text-purple-600 dark:hover:text-purple-400">
          Clubs & Hubs
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-sm">
          {club.name}
        </span>
      </div>

      {/* Hero Club Banner Card */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {club.banner_url ? (
          <div className="h-44 sm:h-56 w-full overflow-hidden bg-slate-800">
            <img src={club.banner_url} alt={club.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900" />
        )}

        <div className="p-6 sm:p-10 -mt-16 sm:-mt-20 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-slate-800 p-2 shadow-lg border-2 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Users className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                  {club.category}
                </span>
                {club.is_verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="w-4 h-4" /> Verified Guild
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {club.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                {club.tagline}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleToggleJoin}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 shadow-xs ${
                club.user_is_member
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {club.user_is_member ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Member ({club.member_count})</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Join Club ({club.member_count})</span>
                </>
              )}
            </button>

            {isOfficerOrLead && (
              <Button
                onClick={() => setIsAnnModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Megaphone className="w-4 h-4" />
                <span>Broadcast Notice</span>
              </Button>
            )}
          </div>
        </div>

        {/* Meeting Schedule Pill */}
        {club.meeting_schedule && (
          <div className="px-6 sm:px-10 pb-6">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span><strong>Official Schedule:</strong> {club.meeting_schedule}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Description & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Mission & Officers */}
        <div className="space-y-6 lg:col-span-1">
          {/* Mission Story */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              About & Focus Areas
            </h2>
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {club.description_markdown}
            </div>
          </div>

          {/* Officers / Leads */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Leadership & Officers
            </h2>
            <div className="space-y-3">
              {club.lead && (
                <Link
                  to={`/profile/${club.lead.username}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                    {club.lead.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                      @{club.lead.username}
                    </span>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                      Club Lead
                    </span>
                  </div>
                </Link>
              )}

              {club.officers && club.officers.filter(o => o.role !== 'LEAD').map(officer => (
                <Link
                  key={officer.id}
                  to={`/profile/${officer.username}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs">
                    {officer.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                      @{officer.username}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Officer
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dedicated Club Announcements */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              Announcements & Scheduled Sessions ({club.announcements?.length || 0})
            </h2>
          </div>

          {!club.announcements || club.announcements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Megaphone className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No announcements posted yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Club officers will post upcoming hackathons, weekly code walkthroughs, and RSVP notices here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {club.announcements.map(ann => (
                <div
                  key={ann.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-3 ${
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
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
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
      </div>

      {/* Modal: Broadcast Announcement */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-500" />
                Broadcast Club Notice
              </h3>
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hands-on Docker & Microservices Clinic"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Type *
                  </label>
                  <select
                    value={annType}
                    onChange={e => setAnnType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="WORKSHOP">Workshop / Clinic</option>
                    <option value="HACKATHON_CALL">Hackathon Notice</option>
                    <option value="RECRUITMENT">Leadership Recruitment</option>
                    <option value="GENERAL">General Bulletin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    RSVP / Registration Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={annRsvp}
                    onChange={e => setAnnRsvp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Details (Markdown) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Date, location, prerequisites, topics covered..."
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={annPinned}
                  onChange={e => setAnnPinned(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pin this notice to top of club announcements
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsAnnModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAnn} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                  {submittingAnn ? 'Publishing...' : 'Broadcast Notice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetailPage;
