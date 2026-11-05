import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogsApi } from '../services/api';
import { BlogPostItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import {
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Send,
  Sparkles,
  Check,
  Award,
  List,
} from 'lucide-react';

export const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState<BlogPostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Engagement States
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Comment States
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const loadPost = async () => {
    if (!id) return;
    try {
      const data = await blogsApi.getBlog(id);
      setPost(data);
      setLikeCount(data.like_count || 0);
      setHasLiked(Boolean(data.user_has_liked));
      setHasBookmarked(Boolean(data.user_has_bookmarked));
    } catch (err: any) {
      setError(err.message || 'Failed to load article.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  // Extract headings from markdown content for Table of Contents
  const tableOfContents = useMemo(() => {
    if (!post?.content_markdown) return [];
    const lines = post.content_markdown.split('\n');
    const headings: { text: string; level: number; id: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const headingId = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        headings.push({ text, level, id: headingId });
      }
    }
    return headings;
  }, [post?.content_markdown]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like this article.');
      return;
    }
    if (!post) return;

    try {
      const res = await blogsApi.toggleLike(post.id);
      setLikeCount(res.like_count);
      setHasLiked(res.user_has_liked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Please log in to bookmark this article.');
      return;
    }
    if (!post) return;

    try {
      const res = await blogsApi.toggleBookmark(post.id);
      setHasBookmarked(res.user_has_bookmarked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleAddComment = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to leave a comment.');
      return;
    }
    const content = parentId ? replyInput.trim() : commentInput.trim();
    if (!content || !post) return;

    setSubmittingComment(true);
    try {
      await blogsApi.addComment(post.id, {
        content,
        parent_id: parentId,
      });
      await loadPost();
      if (parentId) {
        setReplyingToId(null);
        setReplyInput('');
      } else {
        setCommentInput('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading article..." />;
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Article Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || 'This article does not exist.'}</p>
        <Link to="/blogs" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold">
          Explore Technical Articles
        </Link>
      </div>
    );
  }

  const publishedDateStr = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Article Column */}
        <article className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Article Header Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {post.category.name}
                </span>
              )}
              {post.is_editors_pick && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Editor's Pick
                </span>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" /> {post.reading_time_minutes} min read
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author Attribution Card */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to={`/profile/${post.author?.username}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {post.author?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                    {post.author?.full_name || post.author?.username}
                  </p>
                  <p className="text-xs text-slate-400">
                    Published on {publishedDateStr}
                  </p>
                </div>
              </Link>

              {/* Action Buttons Header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleLike}
                  className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                    hasLiked
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Like article"
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-xl border transition text-xs font-semibold ${
                    hasBookmarked
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900 text-amber-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Bookmark article"
                >
                  <Bookmark className={`w-4 h-4 ${hasBookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  title="Share link"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Featured Cover Image */}
          {post.cover_image_url && (
            <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[420px]">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rendered Markdown Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-base text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
            {post.content_markdown}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
              {post.tags.map((t) => (
                <span
                  key={t.id}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}

          {/* Discussion & Comments Section */}
          <div className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" /> Discussion ({post.comments?.length || 0})
            </h2>

            {/* Post a Comment Form */}
            <form onSubmit={(e) => handleAddComment(e)} className="space-y-3">
              <textarea
                rows={3}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? 'Write your constructive feedback or technical thought...'
                    : 'Please log in to join the discussion.'
                }
                disabled={!isAuthenticated}
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !isAuthenticated || !commentInput.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Post Comment
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {(!post.comments || post.comments.length === 0) ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {comment.author_username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          @{comment.author_username}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="pl-4 border-l-2 border-brand-500/30 space-y-2.5 pt-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                @{reply.author_username}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form toggle */}
                    {isAuthenticated && (
                      <div className="pt-1">
                        {replyingToId === comment.id ? (
                          <form onSubmit={(e) => handleAddComment(e, comment.id)} className="space-y-2 pt-2">
                            <input
                              type="text"
                              value={replyInput}
                              onChange={(e) => setReplyInput(e.target.value)}
                              placeholder={`Reply to @${comment.author_username}...`}
                              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="px-3 py-1 text-xs text-slate-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs bg-brand-600 text-white rounded-lg"
                              >
                                Reply
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingToId(comment.id);
                              setReplyInput('');
                            }}
                            className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        {/* Right Sticky Sidebar: TOC & Related Posts */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Table of Contents */}
          {tableOfContents.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <List className="w-4 h-4 text-brand-600" /> Table of Contents
              </h3>
              <nav className="space-y-1.5 text-xs">
                {tableOfContents.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className={`block py-1 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition ${
                      h.level === 2 ? 'pl-3' : h.level === 3 ? 'pl-6' : 'font-semibold'
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Related Articles in Same Category */}
          {post.related_posts && post.related_posts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Related Articles
              </h3>
              <div className="space-y-3">
                {post.related_posts.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/blogs/${rel.slug || rel.id}`}
                    className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition space-y-1"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rel.reading_time_minutes} min read &bull; @{rel.author?.username}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
