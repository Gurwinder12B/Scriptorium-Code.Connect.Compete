import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { communityApi, moderationApi } from '../services/api';
import { Question, Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ChevronUp,
  ChevronDown,
  CheckCircle,
  MessageSquare,
  Flag,
  Share2,
  Clock,
  Eye,
  Send,
  AlertCircle,
  Check,
} from 'lucide-react';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Answer Submission Form
  const [newAnswerMarkdown, setNewAnswerMarkdown] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  // Comment Submission State
  const [commentingTarget, setCommentingTarget] = useState<{ type: 'question' | 'answer'; id: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report Modal State
  const [reportingTarget, setReportingTarget] = useState<{ type: string; id: number } | null>(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadQuestion = async () => {
    if (!id) return;
    try {
      const data = await communityApi.getQuestion(parseInt(id, 10));
      setQuestion(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load question.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const handleVote = async (targetType: 'question' | 'answer', targetId: number, direction: 1 | -1) => {
    if (!isAuthenticated) {
      alert('Please log in to vote.');
      return;
    }
    if (!question) return;

    try {
      // Determine new vote value: toggle off if same
      let currentVal = 0;
      if (targetType === 'question') {
        currentVal = question.user_vote || 0;
      } else {
        const a = question.answers?.find((ans) => ans.id === targetId);
        currentVal = a?.user_vote || 0;
      }

      const newVal = currentVal === direction ? 0 : direction;
      const res = await communityApi.castVote(targetType, targetId, newVal);

      if (targetType === 'question') {
        setQuestion({
          ...question,
          vote_count: res.vote_count,
          user_vote: res.user_vote,
        });
      } else {
        setQuestion({
          ...question,
          answers: question.answers?.map((ans) =>
            ans.id === targetId
              ? { ...ans, vote_count: res.vote_count, user_vote: res.user_vote }
              : ans
          ),
        });
      }
    } catch (err: any) {
      alert(err.message || 'Vote failed');
    }
  };

  const handleAcceptAnswer = async (answerId: number) => {
    if (!question) return;
    try {
      await communityApi.acceptAnswer(question.id, answerId);
      await loadQuestion();
    } catch (err: any) {
      alert(err.message || 'Could not accept answer.');
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !newAnswerMarkdown.trim()) return;

    setAnswerError(null);
    setSubmittingAnswer(true);
    try {
      await communityApi.createAnswer(question.id, {
        content_markdown: newAnswerMarkdown.trim(),
      });
      setNewAnswerMarkdown('');
      await loadQuestion();
    } catch (err: any) {
      setAnswerError(err.message || 'Failed to submit answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentingTarget || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await communityApi.createComment(commentingTarget.type, commentingTarget.id, commentText.trim());
      setCommentText('');
      setCommentingTarget(null);
      await loadQuestion();
    } catch (err: any) {
      alert(err.message || 'Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingTarget) return;

    try {
      await moderationApi.reportContent({
        target_type: reportingTarget.type,
        target_id: reportingTarget.id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportingTarget(null);
        setReportSuccess(false);
        setReportDetails('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Report submission failed.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading discussion..." />;
  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Question Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This question might have been deleted or moderated.'}</p>
        <Link to="/community" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold">
          Return to Community
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === question.author_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Question Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {question.title}
          </h1>
          {question.is_solved && (
            <Badge variant="success" size="md">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> Solved
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Asked by</span>
            <Link to={`/profile/${question.author_username}`} className="font-semibold text-slate-700 hover:text-brand-600">
              {question.author_username}
            </Link>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(question.created_at).toLocaleString()}</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{question.view_count} views</span>
          </div>
        </div>
      </div>

      {/* Main Question Body with Votes */}
      <div className="flex items-start gap-6">
        {/* Voting Sidebar */}
        <div className="flex flex-col items-center space-y-1 shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => handleVote('question', question.id, 1)}
            className={`p-1.5 rounded-lg transition ${
              question.user_vote === 1 ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Upvote question"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-slate-900">{question.vote_count}</span>
          <button
            onClick={() => handleVote('question', question.id, -1)}
            className={`p-1.5 rounded-lg transition ${
              question.user_vote === -1 ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Downvote question"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
            {question.content_markdown}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            {question.tags.map((t) => (
              <Link
                key={t.id}
                to={`/community?tag=${t.slug}`}
                className="text-xs px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                #{t.name}
              </Link>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCommentingTarget({ type: 'question', id: question.id })}
                className="hover:text-slate-700 transition flex items-center gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Add Comment
              </button>
              <button
                onClick={() => setReportingTarget({ type: 'question', id: question.id })}
                className="hover:text-rose-600 transition flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>
          </div>

          {/* Question Comments */}
          {question.comments && question.comments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
              {question.comments.map((c) => (
                <div key={c.id} className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 mr-2">{c.author_username}:</span>
                  <span>{c.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-bold text-slate-900">
          {question.answers?.length || 0} Answers
        </h2>

        {question.answers?.map((ans) => (
          <div
            key={ans.id}
            className={`bg-white p-6 sm:p-8 rounded-2xl border shadow-sm flex items-start gap-6 transition ${
              ans.is_accepted ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200'
            }`}
          >
            {/* Answer Votes */}
            <div className="flex flex-col items-center space-y-1 shrink-0 text-center">
              <button
                onClick={() => handleVote('answer', ans.id, 1)}
                className={`p-1.5 rounded-lg transition ${
                  ans.user_vote === 1 ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <span className="text-base font-bold text-slate-900">{ans.vote_count}</span>
              <button
                onClick={() => handleVote('answer', ans.id, -1)}
                className={`p-1.5 rounded-lg transition ${
                  ans.user_vote === -1 ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              {ans.is_accepted && (
                <div className="mt-2 text-emerald-600" title="Accepted Solution">
                  <CheckCircle className="w-7 h-7" />
                </div>
              )}

              {isAuthor && !ans.is_accepted && (
                <button
                  onClick={() => handleAcceptAnswer(ans.id)}
                  className="mt-2 p-1.5 rounded-lg text-slate-300 hover:text-emerald-600 transition"
                  title="Mark as accepted answer"
                >
                  <Check className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Answer Content */}
            <div className="flex-1 space-y-4">
              <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
                {ans.content_markdown}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCommentingTarget({ type: 'answer', id: ans.id })}
                    className="hover:text-slate-700 font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Comment
                  </button>
                  <button
                    onClick={() => setReportingTarget({ type: 'answer', id: ans.id })}
                    className="hover:text-rose-600 flex items-center gap-1"
                  >
                    <Flag className="w-3.5 h-3.5" /> Report
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Answered by</span>
                  <Link to={`/profile/${ans.author_username}`} className="font-semibold text-slate-700 hover:text-brand-600">
                    {ans.author_username}
                  </Link>
                  <span>&bull;</span>
                  <span>{new Date(ans.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Answer Comments */}
              {ans.comments && ans.comments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                  {ans.comments.map((ac) => (
                    <div key={ac.id} className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <span className="font-semibold text-slate-800 mr-2">{ac.author_username}:</span>
                      <span>{ac.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Write Answer Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Your Technical Answer</h3>
        {answerError && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-sm border border-rose-200">
            {answerError}
          </div>
        )}

        {isAuthenticated ? (
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <textarea
              rows={6}
              value={newAnswerMarkdown}
              onChange={(e) => setNewAnswerMarkdown(e.target.value)}
              placeholder="Write your answer using clear explanations and code blocks (```language ... ```)..."
              required
              className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm leading-relaxed"
            />
            <button
              type="submit"
              disabled={submittingAnswer || !newAnswerMarkdown.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submittingAnswer ? 'Posting Answer...' : 'Post Your Answer'}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600 mb-3">You must be logged in to post an answer.</p>
            <Link to="/login" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold">
              Log in to Answer
            </Link>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <Modal
        isOpen={!!commentingTarget}
        onClose={() => setCommentingTarget(null)}
        title="Add a Comment"
      >
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Keep comments concise and constructive (max 1000 characters)..."
            required
            className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCommentingTarget(null)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {submittingComment ? 'Posting...' : 'Submit Comment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={!!reportingTarget}
        onClose={() => setReportingTarget(null)}
        title="Report Content to Moderators"
      >
        {reportSuccess ? (
          <div className="p-4 text-center text-emerald-700 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <p className="font-semibold text-sm">Report submitted successfully.</p>
            <p className="text-xs text-slate-500 mt-1">Our moderation team will review this content.</p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
              >
                <option value="spam">Spam / Advertising</option>
                <option value="harassment">Harassment or Offensive Content</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="low_quality">Extremely Low Quality</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe why this violates platform guidelines..."
                className="w-full p-3 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportingTarget(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
