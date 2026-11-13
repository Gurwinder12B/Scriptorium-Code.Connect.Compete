import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizzesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QuizItem, QuizQuestion } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  Award,
  Send,
  X,
  RotateCcw,
} from 'lucide-react';

export const QuizLiveRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responses map: { [questionId: string]: string (e.g. "A") }
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Flagged questions set: Set of question indices
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());

  // Timer: seconds remaining
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1500); // 25 mins default
  const [timeTakenSeconds, setTimeTakenSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Confirm submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Team info
  const [teamInfo, setTeamInfo] = useState<{ id?: number; name: string }>({
    name: `${user?.username || 'Solo'} Team`,
  });

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await quizzesApi.getQuiz(id);
        setQuiz(data);
        const qs = data.questions || [];
        setQuestions(qs);

        const totalSecs = (data.duration_minutes || 25) * 60;
        setSecondsRemaining(totalSecs);

        // Check local stored team
        try {
          const stored = localStorage.getItem(`scriptorium_my_team_${data.id}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            setTeamInfo({ id: parsed.id, name: parsed.name });
          }
        } catch {}
      } catch (err) {
        console.error('Failed to load quiz room:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Countdown Timer
  useEffect(() => {
    if (loading || !quiz) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinalSubmit(true); // Auto-submit when time expires!
          return 0;
        }
        return prev - 1;
      });
      setTimeTakenSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, quiz]);

  const handleSelectOption = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionId,
    }));
  };

  const handleClearResponse = (questionId: number) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[String(questionId)];
      return copy;
    });
  };

  const handleToggleFlag = (index: number) => {
    setFlaggedIndices((prev) => {
      const copy = new Set(prev);
      if (copy.has(index)) {
        copy.delete(index);
      } else {
        copy.add(index);
      }
      return copy;
    });
  };

  const handleFinalSubmit = async (isAuto = false) => {
    if (!quiz || submitting) return;

    setSubmitting(true);
    try {
      if (timerRef.current) clearInterval(timerRef.current);

      const scorecard = await quizzesApi.submitQuiz(quiz.id, {
        team_id: teamInfo.id,
        team_name: teamInfo.name,
        answers,
        time_taken_seconds: timeTakenSeconds,
      });

      // Navigate to detailed scorecard & answer key review!
      navigate(`/quizzes/${quiz.slug || quiz.id}/results/${scorecard.submission_id}`, {
        state: { scorecard },
      });
    } catch (err: any) {
      alert(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initializing live competition room..." />;
  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold">No questions available in this competition.</h2>
        <Link to="/quizzes" className="mt-4 inline-block px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold">
          Return to Arena
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Format timer MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timerFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeCritical = secondsRemaining <= 300; // < 5 mins
  const isTimeUrgent = secondsRemaining <= 60; // < 1 min

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Award className="w-4 h-4" />
          </span>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Competing as <span className="font-semibold text-violet-600 dark:text-violet-400">{teamInfo.name}</span>
            </p>
          </div>
        </div>

        {/* Live Timer & Submit Button */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-extrabold border transition ${
              isTimeUrgent
                ? 'bg-rose-500 text-white border-rose-600 animate-bounce'
                : isTimeCritical
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timerFormatted}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Quiz
          </button>
        </div>
      </header>

      {/* Main Arena Workspace */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Navigator Palette */}
        <div className="lg:col-span-1 order-2 lg:order-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Question Palette
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {answeredCount}/{questions.length} Answered
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {questions.map((q, idx) => {
                const isAnswered = answers[String(q.id)] !== undefined;
                const isFlagged = flaggedIndices.has(idx);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                      isCurrent
                        ? 'ring-2 ring-violet-500 border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                        : isAnswered
                        ? 'bg-emerald-500 text-slate-950 border-emerald-600 font-extrabold'
                        : isFlagged
                        ? 'bg-amber-400 text-slate-950 border-amber-500'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Legend */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700"></span>
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400"></span>
              <span>Flagged for Review ({flaggedIndices.size})</span>
            </div>
          </div>
        </div>

        {/* Right: Active Question Card */}
        <div className="lg:col-span-3 order-1 lg:order-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Question Header & Points */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {currentQ.points} Points
              </span>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question_text}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = answers[String(currentQ.id)] === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 group ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 text-violet-900 dark:text-violet-100 shadow-sm ring-1 ring-violet-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-sm font-medium pt-0.5 leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions: Flag, Clear, Nav */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleFlag(currentIndex)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  flaggedIndices.has(currentIndex)
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {flaggedIndices.has(currentIndex) ? 'Flagged' : 'Flag for Review'}
              </button>

              {answers[String(currentQ.id)] && (
                <button
                  onClick={() => handleClearResponse(currentQ.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Choice
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition"
                >
                  Finish & Review
                  <Send className="w-3.5 h-3.5 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Final Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950 text-violet-600 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Submit Competition Answers?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your responses will be graded instantly against the official competition answer key.
              </p>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Answered</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Unanswered</span>
                <span className="text-base font-extrabold text-rose-500">
                  {unansweredCount}
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>You have {unansweredCount} unanswered question(s). Unanswered questions earn 0 points.</span>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Back to Questions
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Grading Answers...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
