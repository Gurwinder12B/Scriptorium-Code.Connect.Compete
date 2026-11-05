import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  AlertTriangle,
  ArrowRight,
  Plus,
  Filter,
  Check,
  Send,
  Eye,
  Edit,
  Tag,
  Sparkles,
  CalendarDays,
  FileText
} from 'lucide-react';
import { blogsApi } from '../services/api';
import { BlogPostItem, EditorialCalendarData, BlogCategory } from '../types';
import Button from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const EditorialCalendarPage: React.FC = () => {
  const [calendarData, setCalendarData] = useState<EditorialCalendarData | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [articles, setArticles] = useState<BlogPostItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING_REVIEW');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rejection modal state
  const [rejectionTargetId, setRejectionTargetId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Scheduling modal state
  const [scheduleTargetId, setScheduleTargetId] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');

  // Add Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Success toast/notification
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchEditorialData = async () => {
    setIsLoading(true);
    try {
      const [calRes, allRes, catRes] = await Promise.all([
        blogsApi.getEditorialCalendar(),
        blogsApi.getBlogs({ per_page: 50, sort: 'newest' }),
        blogsApi.getCategories()
      ]);
      setCalendarData(calRes || null);
      setArticles((Array.isArray(allRes) ? allRes : (allRes as any)?.items) || []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err) {
      console.error('Failed to load editorial data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEditorialData();
  }, []);

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleModerate = async (id: number, action: string, reason?: string, date?: string) => {
    setIsSubmitting(true);
    try {
      await blogsApi.moderateBlog(id, {
        action,
        reason,
        scheduled_at: date
      });
      showSuccess(`Article successfully updated: ${action}`);
      setRejectionTargetId(null);
      setRejectionReason('');
      setScheduleTargetId(null);
      setScheduledDate('');
      await fetchEditorialData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await blogsApi.createCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
      showSuccess(`Created category: ${newCatName}`);
      setNewCatName('');
      setNewCatDesc('');
      setIsCategoryModalOpen(false);
      const catRes = await blogsApi.getCategories();
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const filteredArticles = articles.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const pendingCount = articles.filter(a => a.status === 'PENDING_REVIEW').length;
  const scheduledCount = articles.filter(a => !!a.scheduled_at && a.status !== 'PUBLISHED').length;
  const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Editorial Desk
            </span>
            <span className="text-slate-400 text-sm">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">Target Cadence: 1 post / 2-3 days</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Publishing Cadence & Review Queue
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Manage peer-submitted student tech articles, maintain publishing cadence, and feature stellar writing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>Manage Categories</span>
          </Button>
          <Link to="/blogs/write">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Draft New Article</span>
            </Button>
          </Link>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Cadence KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Cadence Health</span>
            <div className={`p-2 rounded-lg ${calendarData?.gaps && calendarData.gaps.length > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {calendarData?.gaps && calendarData.gaps.length > 0 ? `${calendarData.gaps.length} Gaps Detected` : 'Cadence Optimal'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Target: 1 article every 2-3 days
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Review</span>
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Awaiting editorial feedback
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Scheduled</span>
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{scheduledCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Future queued publications
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Published Total</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{publishedCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live in knowledge base
            </p>
          </div>
        </div>
      </div>

      {/* Cadence Gap Alerts (if any) */}
      {calendarData?.gaps && calendarData.gaps.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Cadence Gaps Detected in Publication Schedule</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            To maintain reader momentum, the platform recommends at least one published or scheduled article every 2 to 3 days.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {calendarData.gaps.map((gap, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">{gap.gap_days} Day Gap</span>
                  <span className="text-slate-500">{new Date(gap.start_date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{gap.message}</p>
                <div className="mt-2 text-right">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline" onClick={() => setFilterStatus('PENDING_REVIEW')}>
                    Review pending drafts →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Review Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'PENDING_REVIEW', label: `Pending Review (${pendingCount})` },
              { id: 'ALL', label: 'All Articles' },
              { id: 'PUBLISHED', label: 'Published' },
              { id: 'DRAFT', label: 'Drafts' },
              { id: 'REJECTED', label: 'Needs Revision' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredArticles.length} articles
          </div>
        </div>

        {/* Article Table / Rows */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No articles in this queue"
              description="Articles submitted by students for peer or editorial review will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase ${
                      article.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400'
                        : article.status === 'PENDING_REVIEW'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400'
                        : article.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {article.status.replace('_', ' ')}
                    </span>

                    {article.is_featured && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}

                    {article.category && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        • {article.category.name}
                      </span>
                    )}

                    <span className="text-xs text-slate-400">
                      • {article.reading_time_minutes} min read
                    </span>
                  </div>

                  <Link
                    to={`/blogs/${article.slug || article.id}`}
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1 block"
                  >
                    {article.title}
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>
                      Author: <strong className="text-slate-800 dark:text-slate-200">@{article.author?.username || 'anonymous'}</strong>
                    </span>
                    <span>
                      Submitted: {new Date(article.created_at).toLocaleDateString()}
                    </span>
                    {article.scheduled_at && (
                      <span className="text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> Scheduled: {new Date(article.scheduled_at).toLocaleDateString()}
                      </span>
                    )}
                    {article.rejection_reason && (
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Feedback: {article.rejection_reason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap justify-start lg:justify-end">
                  <Link to={`/blogs/${article.slug || article.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                  </Link>

                  <Link to={`/blogs/edit/${article.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>

                  {/* Feature toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerate(article.id, article.is_featured ? 'UNFEATURE' : 'FEATURE')}
                    className={`h-8 px-2.5 text-xs ${article.is_featured ? 'border-amber-300 dark:border-amber-700 text-amber-600' : ''}`}
                    title={article.is_featured ? 'Remove featured spotlight' : 'Feature on blog hero spotlight'}
                  >
                    <Star className={`w-3.5 h-3.5 mr-1 ${article.is_featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                    {article.is_featured ? 'Featured' : 'Feature'}
                  </Button>

                  {/* Schedule button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScheduleTargetId(article.id);
                      setScheduledDate(article.scheduled_at ? article.scheduled_at.split('T')[0] : '');
                    }}
                    className="h-8 px-2.5 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 mr-1 text-teal-500" />
                    Schedule
                  </Button>

                  {/* Approve */}
                  {article.status !== 'PUBLISHED' && (
                    <Button
                      size="sm"
                      onClick={() => handleModerate(article.id, 'APPROVE')}
                      className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isSubmitting}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                  )}

                  {/* Reject / Request Revisions */}
                  {article.status !== 'REJECTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectionTargetId(article.id)}
                      className="h-8 px-2.5 text-xs text-rose-600 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Revisions
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Schedule Post */}
      {scheduleTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-500" />
              Schedule Publication Date
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Pick the target release date to align with the 2-3 day publication cadence.
            </p>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setScheduleTargetId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleModerate(scheduleTargetId, 'SCHEDULE', undefined, scheduledDate)}
                disabled={!scheduledDate || isSubmitting}
              >
                Set Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Revisions / Rejection */}
      {rejectionTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Request Revisions or Reject
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Provide constructive feedback for the author detailing technical corrections or formatting improvements required.
            </p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please add code snippets demonstrating the async await edge case and proofread section 2..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectionTargetId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => handleModerate(rejectionTargetId, 'REJECT', rejectionReason)}
                disabled={!rejectionReason.trim() || isSubmitting}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" />
              Add Technical Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DevOps & Cloud"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of topics covered..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorialCalendarPage;
