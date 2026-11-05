import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Code2,
  FolderGit2,
  ExternalLink,
  Github,
  ThumbsUp,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Layout,
  MessageSquare,
  Users,
  Send,
  Plus,
  Share2,
  AlertCircle,
  Eye,
  Check,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { projectsApi, uploadApi } from '../services/api';
import { ProjectItem, CodeReviewItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { MediaLightbox } from '../components/events/MediaLightbox';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state for screenshots
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review submission state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSummary, setReviewSummary] = useState('');
  const [archFeedback, setArchFeedback] = useState('');
  const [perfFeedback, setPerfFeedback] = useState('');
  const [secFeedback, setSecFeedback] = useState('');
  const [uiFeedback, setUiFeedback] = useState('');
  const [overallRating, setOverallRating] = useState(5);

  // Comment on review state
  const [commentingReviewId, setCommentingReviewId] = useState<number | null>(null);
  const [reviewCommentText, setReviewCommentText] = useState('');
  const [reviewCodeSnippet, setReviewCodeSnippet] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Upload screenshot modal state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotCaption, setScreenshotCaption] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const fetchProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await projectsApi.getProject(id);
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleToggleProjectUpvote = async () => {
    if (!project) return;
    if (!isAuthenticated) {
      alert('Please log in to upvote showcase projects.');
      return;
    }
    try {
      const res = await projectsApi.toggleUpvote(project.id);
      setProject(prev =>
        prev
          ? {
              ...prev,
              upvote_count: res.upvote_count,
              user_has_upvoted: res.user_has_upvoted,
            }
          : null
      );
    } catch (err: any) {
      alert(err.message || 'Upvote failed');
    }
  };

  const handleToggleReviewUpvote = async (reviewId: number) => {
    if (!isAuthenticated) {
      alert('Please log in to upvote reviews.');
      return;
    }
    if (!project) return;
    try {
      const res = await projectsApi.upvoteReview(project.id, reviewId);
      setProject(prev => {
        if (!prev || !prev.reviews) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map(r =>
            r.id === reviewId
              ? { ...r, upvote_count: res.upvote_count, user_has_upvoted: res.user_has_upvoted }
              : r
          ),
        };
      });
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleUpdateReviewStatus = async (reviewId: number, status: 'OPEN' | 'ADDRESSED' | 'RESOLVED') => {
    if (!project) return;
    try {
      await projectsApi.updateReviewStatus(project.id, reviewId, status);
      setProject(prev => {
        if (!prev || !prev.reviews) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map(r => (r.id === reviewId ? { ...r, status } : r)),
        };
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update review status');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !reviewSummary.trim()) return;
    setSubmittingReview(true);
    try {
      await projectsApi.submitReview(project.id, {
        summary: reviewSummary.trim(),
        architecture_feedback: archFeedback.trim() || undefined,
        performance_feedback: perfFeedback.trim() || undefined,
        security_feedback: secFeedback.trim() || undefined,
        ui_ux_feedback: uiFeedback.trim() || undefined,
        rating_overall: overallRating,
      });

      setIsReviewModalOpen(false);
      // Reset form
      setReviewSummary('');
      setArchFeedback('');
      setPerfFeedback('');
      setSecFeedback('');
      setUiFeedback('');
      setOverallRating(5);

      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitReviewComment = async (reviewId: number) => {
    if (!project || !reviewCommentText.trim()) return;
    setSubmittingComment(true);
    try {
      await projectsApi.addReviewComment(project.id, reviewId, {
        content: reviewCommentText.trim(),
        code_snippet: reviewCodeSnippet.trim() || undefined,
      });

      setCommentingReviewId(null);
      setReviewCommentText('');
      setReviewCodeSnippet('');

      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !screenshotUrl.trim()) return;
    try {
      await projectsApi.addMedia(project.id, {
        media_url: screenshotUrl.trim(),
        caption: screenshotCaption.trim() || undefined,
      });
      setIsMediaModalOpen(false);
      setScreenshotUrl('');
      setScreenshotCaption('');
      await fetchProject();
    } catch (err: any) {
      alert(err.message || 'Failed to add screenshot');
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <LoadingSpinner size="lg" text="Loading project details & code reviews..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-slate-500 text-sm">{error || "The project you requested doesn't exist."}</p>
        <Link to="/projects">
          <Button className="mt-4">Back to Showcase</Button>
        </Link>
      </div>
    );
  }

  const isAuthor = user && project.author && user.id === project.author.id;
  const averageRating =
    project.reviews && project.reviews.length > 0
      ? (
          project.reviews.reduce((acc, r) => acc + (r.rating_overall || 5), 0) /
          project.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/projects" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Showcase
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-sm">
          {project.title}
        </span>
      </div>

      {/* Hero Showcase Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {project.category}
              </span>
              {averageRating && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {averageRating} / 5.0 Peer Rating
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.tagline}
            </p>

            {/* Author Attribution & Collaborators */}
            <div className="flex items-center gap-4 flex-wrap pt-2 text-xs text-slate-500 dark:text-slate-400">
              <Link
                to={`/profile/${project.author?.username}`}
                className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold flex items-center justify-center text-xs">
                  {project.author?.username?.charAt(0).toUpperCase()}
                </div>
                <span>By @{project.author?.username}</span>
              </Link>

              {project.collaborators && project.collaborators.length > 0 && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Collaborators:</span>
                  {project.collaborators.map(c => (
                    <Link
                      key={c.id}
                      to={`/profile/${c.username}`}
                      className="hover:underline font-medium text-slate-700 dark:text-slate-300"
                    >
                      @{c.username}
                    </Link>
                  ))}
                </div>
              )}

              <span>• Published {new Date(project.created_at).toLocaleDateString()}</span>
              <span>• {project.view_count} views</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap lg:flex-col gap-3 flex-shrink-0">
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Live Demo</span>
              </a>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition"
              >
                <Github className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            )}

            <button
              onClick={handleToggleProjectUpvote}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                project.user_has_upvoted
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${project.user_has_upvoted ? 'fill-indigo-600 text-indigo-600' : ''}`} />
              <span>{project.upvote_count} Upvotes</span>
            </button>
          </div>
        </div>

        {/* Tech Stack Pills */}
        {project.tags && project.tags.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stack:</span>
            {project.tags.map(tag => (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Screenshots & Media Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-500" />
            Project Screenshots & Architecture Diagrams
          </h2>
          {isAuthor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMediaModalOpen(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Screenshot</span>
            </Button>
          )}
        </div>

        {project.media && project.media.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.media.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                className="group relative h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs"
              >
                <img
                  src={m.media_url}
                  alt={m.caption || 'Project screenshot'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                  <div className="text-white text-xs font-medium truncate flex items-center justify-between w-full">
                    <span>{m.caption || 'Click to enlarge'}</span>
                    <Maximize2 className="w-4 h-4 ml-2 flex-shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No additional screenshots attached to this project.
            </p>
          </div>
        )}
      </div>

      {/* Project Description Story */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <FolderGit2 className="w-5 h-5 text-indigo-500" />
          Project Overview & Implementation Story
        </h2>
        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {project.description_markdown}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STRUCTURED PEER CODE REVIEWS & FEEDBACK SECTION */}
      {/* ========================================================================= */}
      <div id="reviews" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                Quality Assurance
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500">Peer Code Reviews ({project.reviews?.length || 0})</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Peer Code Reviews & Architectural Feedback
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Constructive evaluations on architecture, performance, security, and UI/UX.
            </p>
          </div>

          {!isAuthor && (
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in to submit a peer code review.');
                } else {
                  setIsReviewModalOpen(true);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 font-semibold shadow-sm flex-shrink-0"
            >
              <Code2 className="w-4 h-4" />
              <span>Submit Code Review</span>
            </Button>
          )}
        </div>

        {/* Reviews List */}
        {!project.reviews || project.reviews.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Code2 className="w-10 h-10 text-indigo-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No code reviews submitted yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Be the first to inspect the source code, evaluate the architecture, and suggest performance or security improvements!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {project.reviews.map(review => (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {review.reviewer?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${review.reviewer?.username}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          @{review.reviewer?.username}
                        </Link>
                        <span className="text-xs text-slate-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating_overall
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status & Resolution Controls */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      review.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400'
                        : review.status === 'ADDRESSED'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400'
                    }`}>
                      {review.status}
                    </span>

                    {/* Author resolution toggle buttons */}
                    {isAuthor && (
                      <div className="flex items-center gap-1">
                        {review.status !== 'ADDRESSED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateReviewStatus(review.id, 'ADDRESSED')}
                            className="h-7 px-2 text-[11px]"
                          >
                            Mark Addressed
                          </Button>
                        )}
                        {review.status !== 'RESOLVED' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReviewStatus(review.id, 'RESOLVED')}
                            className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Summary */}
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  "{review.summary}"
                </div>

                {/* Structured 4-Quadrant Criteria Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Architecture & Cleanliness */}
                  {review.architecture_feedback && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <FolderGit2 className="w-4 h-4 text-indigo-500" />
                        <span>Architecture & Cleanliness</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {review.architecture_feedback}
                      </p>
                    </div>
                  )}

                  {/* Performance & Optimization */}
                  {review.performance_feedback && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Performance & Optimization</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {review.performance_feedback}
                      </p>
                    </div>
                  )}

                  {/* Security Considerations */}
                  {review.security_feedback && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Security Considerations</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {review.security_feedback}
                      </p>
                    </div>
                  )}

                  {/* UI/UX & Ergonomics */}
                  {review.ui_ux_feedback && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <Layout className="w-4 h-4 text-sky-500" />
                        <span>UI/UX & Developer Experience</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {review.ui_ux_feedback}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upvote & Discussion Action Bar */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => handleToggleReviewUpvote(review.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      review.user_has_upvoted
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${review.user_has_upvoted ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    <span>Helpful Review ({review.upvote_count})</span>
                  </button>

                  <button
                    onClick={() => setCommentingReviewId(commentingReviewId === review.id ? null : review.id)}
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply with code snippet</span>
                  </button>
                </div>

                {/* Threaded Comments & Code Snippet Discussions */}
                {review.comments && review.comments.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Author Responses & Solutions
                    </span>
                    {review.comments.map(c => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-500">
                          <strong className="text-slate-900 dark:text-white">@{c.author?.username}</strong>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{c.content}</p>
                        {c.code_snippet && (
                          <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto font-mono text-[11px] leading-relaxed">
                            <code>{c.code_snippet}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Comment Box */}
                {commentingReviewId === review.id && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 pt-4">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Reply to this Code Review
                    </h4>
                    <textarea
                      rows={2}
                      placeholder="Explain your resolution or ask clarifying questions..."
                      value={reviewCommentText}
                      onChange={e => setReviewCommentText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="Optional code snippet or commit patch..."
                      value={reviewCodeSnippet}
                      onChange={e => setReviewCodeSnippet(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommentingReviewId(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={submittingComment || !reviewCommentText.trim()}
                        onClick={() => handleSubmitReviewComment(review.id)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {submittingComment ? 'Posting...' : 'Post Reply'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox for screenshots */}
      {project.media && project.media.length > 0 && (
        <MediaLightbox
          isOpen={lightboxOpen}
          items={project.media.map(m => ({
            id: m.id,
            event_id: project.id,
            media_type: 'image',
            media_url: m.media_url,
            caption: m.caption,
            display_order: m.display_order || 0,
            created_at: m.created_at,
          }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={idx => setLightboxIndex(idx)}
        />
      )}

      {/* Modal: Submit Structured Code Review */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-500" />
                  Submit Peer Code Review
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Provide constructive, actionable feedback to help the author elevate their software engineering practices.
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Overall Rating (1 - 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOverallRating(star)}
                      className="p-1 text-amber-400 focus:outline-hidden"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2">
                    {overallRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Review Headline / Executive Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robust concurrency model with minor memory optimization suggestions"
                  value={reviewSummary}
                  onChange={e => setReviewSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Architecture & Cleanliness Feedback</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Module decoupling, design patterns, separation of concerns..."
                  value={archFeedback}
                  onChange={e => setArchFeedback(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Performance & Optimization Feedback</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Latency hotspots, algorithmic complexity, query caching, memory buffers..."
                  value={perfFeedback}
                  onChange={e => setPerfFeedback(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Security & Resilience Considerations</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Input sanitization, auth validation, rate limiting, vulnerability prevention..."
                  value={secFeedback}
                  onChange={e => setSecFeedback(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-sky-500" />
                  <span>UI/UX & Developer Ergonomics</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Design polish, accessibility, error messaging, developer experience..."
                  value={uiFeedback}
                  onChange={e => setUiFeedback(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReview || !reviewSummary.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {submittingReview ? 'Submitting...' : 'Post Code Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Screenshot */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Add Project Screenshot
            </h3>
            <form onSubmit={handleAddMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={screenshotUrl}
                  onChange={e => setScreenshotUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dashboard view with real-time analytics"
                  value={screenshotCaption}
                  onChange={e => setScreenshotCaption(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsMediaModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add to Gallery
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
