import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { quizzesApi } from '../services/api';
import { QuizScorecard } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowRight,
  Shield,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Share2,
  AlertCircle,
  Check,
  X,
  BookOpen,
} from 'lucide-react';

export const QuizResultsPage: React.FC = () => {
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const location = useLocation();

  const [scorecard, setScorecard] = useState<QuizScorecard | null>(
    (location.state as any)?.scorecard || null
  );
  const [loading, setLoading] = useState(!scorecard);
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    async function load() {
      if (scorecard) return;
      if (!id || !submissionId) return;

      setLoading(true);
      try {
        const data = await quizzesApi.getSubmission(Number(id) || 1, Number(submissionId));
        if (data) {
          setScorecard(data);
        }
      } catch (err) {
        console.error('Failed to load scorecard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, submissionId, scorecard]);

  if (loading) return <LoadingSpinner text="Computing automated score & solution answer key..." />;
  if (!scorecard) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Scorecard Not Found</h2>
        <p className="text-xs text-slate-500">Could not retrieve the results for this submission.</p>
        <Link to="/quizzes" className="inline-block px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold">
          Return to Arena
        </Link>
      </div>
    );
  }

  const reviewItems = scorecard.answer_key_review || [];
  const filteredItems = reviewItems.filter((item) => {
    if (filterMode === 'correct') return item.is_correct;
    if (filterMode === 'incorrect') return !item.is_correct;
    return true;
  });

  const minutesTaken = Math.floor(scorecard.time_taken_seconds / 60);
  const secondsTaken = scorecard.time_taken_seconds % 60;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Celebration & Scorecard Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-brand-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Evaluation Complete
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Competition Scorecard
            </h1>
            <p className="text-sm text-violet-200">
              Team: <span className="font-bold text-white">{scorecard.team_name}</span> • {scorecard.quiz_title}
            </p>
          </div>

          {/* Big Score Ring / Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center min-w-[200px] shrink-0">
            <span className="block text-xs uppercase tracking-wider text-violet-200 font-bold">Total Score</span>
            <div className="text-4xl sm:text-5xl font-black text-amber-300 mt-1">
              {scorecard.score}
              <span className="text-lg font-bold text-white/70"> / {scorecard.total_points}</span>
            </div>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-400 text-slate-950">
              {scorecard.percentage}% Accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="block text-xs font-bold text-slate-400 uppercase">Verdict</span>
          <span
            className={`text-lg font-extrabold mt-1 inline-block ${
              scorecard.passed ? 'text-emerald-500' : 'text-amber-500'
            }`}
          >
            {scorecard.passed ? 'PASSED QUALIFIER' : 'COMPLETED'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="block text-xs font-bold text-slate-400 uppercase">Correct Answers</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
            {scorecard.correct_count} / {scorecard.total_questions}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="block text-xs font-bold text-slate-400 uppercase">Time Elapsed</span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 inline-block">
            {minutesTaken}m {secondsTaken}s
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="block text-xs font-bold text-slate-400 uppercase">Answer Key Status</span>
          <span className="text-lg font-extrabold text-violet-600 dark:text-violet-400 mt-1 inline-block">
            100% Verified
          </span>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mr-2">Filter Answers:</span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Questions ({reviewItems.length})
          </button>
          <button
            onClick={() => setFilterMode('correct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'correct'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Correct ({scorecard.correct_count})
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === 'incorrect'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Incorrect ({scorecard.incorrect_count})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/quizzes/${scorecard.quiz_id}/leaderboard`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition"
          >
            <Trophy className="w-4 h-4" />
            View Leaderboard
          </Link>
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Arena Lobby
          </Link>
        </div>
      </div>

      {/* Official Answer Key Review Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" />
            Official Answer Key & Solution Review
          </h2>
          <span className="text-xs text-slate-500">
            Comparing team response vs official key
          </span>
        </div>

        <div className="space-y-4">
          {filteredItems.map((item, idx) => {
            const isCorrect = item.is_correct;

            return (
              <div
                key={item.question_id}
                className={`p-6 rounded-3xl border transition shadow-sm bg-white dark:bg-slate-900 space-y-4 ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/50'
                    : 'border-rose-200 dark:border-rose-900/50'
                }`}
              >
                {/* Question Status Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Correct (+{item.points_earned} Pts)
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" /> Incorrect (0/{item.max_points} Pts)
                        </>
                      )}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    Max: {item.max_points} Pts
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {item.question_text}
                </p>

                {/* Options with Answer Key Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {item.options.map((opt) => {
                    const isSelected = item.selected_answer === opt.id;
                    const isOfficial = item.correct_answer === opt.id;

                    let badgeClass = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300';
                    if (isOfficial) {
                      badgeClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500';
                    } else if (isSelected && !isOfficial) {
                      badgeClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${badgeClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0 ${
                              isOfficial
                                ? 'bg-emerald-500 text-slate-950'
                                : isSelected
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        {/* Status Label on Option */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isOfficial && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Answer Key
                            </span>
                          )}
                          {isSelected && !isOfficial && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                              <X className="w-3 h-3" /> Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation Box */}
                {item.explanation && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider text-[10px] block">
                      Answer Key Solution & Technical Explanation:
                    </span>
                    <p className="leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
