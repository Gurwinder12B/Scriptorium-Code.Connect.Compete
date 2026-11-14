import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizzesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QuizItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import {
  Trophy,
  Clock,
  Users,
  Search,
  Plus,
  Play,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  X,
  Trash2,
  Award,
  Filter,
} from 'lucide-react';

export const QuizDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const canCreateQuiz = Boolean(user && (user.role === 'admin' || user.role === 'developer'));
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Customize Quiz Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  
  // Customization Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Algorithms & CS');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [maxTeams, setMaxTeams] = useState(50);
  const [passingScore, setPassingScore] = useState(30);
  const [status, setStatus] = useState<'LIVE' | 'UPCOMING' | 'ENDED'>('LIVE');
  const [coverUrl, setCoverUrl] = useState('');

  // Questions with Answer Key State
  const [questions, setQuestions] = useState<
    Array<{
      question_text: string;
      options: Array<{ id: string; text: string }>;
      correct_answer: string;
      points: number;
      explanation: string;
    }>
  >([
    {
      question_text: 'What is the average time complexity of searching in a Hash Map with a good hash function?',
      options: [
        { id: 'A', text: 'O(1)' },
        { id: 'B', text: 'O(log n)' },
        { id: 'C', text: 'O(n)' },
        { id: 'D', text: 'O(n^2)' },
      ],
      correct_answer: 'A',
      points: 10,
      explanation: 'Hash maps compute bucket indices via hashing in constant time O(1) on average with low collision rates.',
    },
    {
      question_text: 'Which data structure follows the Last-In, First-Out (LIFO) order?',
      options: [
        { id: 'A', text: 'Queue' },
        { id: 'B', text: 'Stack' },
        { id: 'C', text: 'Array' },
        { id: 'D', text: 'Tree' },
      ],
      correct_answer: 'B',
      points: 10,
      explanation: 'A stack strictly enforces LIFO operations where the most recently pushed element is popped first.',
    },
  ]);

  const categories = [
    'ALL',
    'Algorithms & CS',
    'Web Systems',
    'Artificial Intelligence',
    'Cybersecurity',
    'Database Systems',
  ];

  const statuses = [
    { label: 'All Contests', value: 'ALL' },
    { label: 'Live Now', value: 'LIVE' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Ended', value: 'ENDED' },
  ];

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizzesApi.getQuizzes({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        q: searchQuery.trim() || undefined,
      });
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ],
        correct_answer: 'A',
        points: 10,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please enter a competition title.');

    setSavingQuiz(true);
    try {
      await quizzesApi.createQuiz({
        title: title.trim(),
        description: description.trim() || 'Scriptorium Developer Quiz Competition',
        category,
        duration_minutes: Number(durationMinutes),
        min_team_size: Number(minTeamSize),
        max_team_size: Number(maxTeamSize),
        max_teams: Number(maxTeams),
        passing_score: Number(passingScore),
        status,
        cover_image_url: coverUrl.trim() || undefined,
        questions: questions.map((q, i) => ({
          ...q,
          order_index: i + 1,
        })),
      });

      setIsModalOpen(false);
      // Reset
      setTitle('');
      setDescription('');
      await loadQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to create quiz competition.');
    } finally {
      setSavingQuiz(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-brand-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Competitive Tech Arena
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Scriptorium <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-brand-300">Quiz Arena</span>
          </h1>
          <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed">
            Form teams, battle through time-limited technical quizzes, and get instant scored evaluations with official answer keys and transparent solution breakdowns.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {canCreateQuiz && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-sm shadow-md transition transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Organize Custom Quiz
              </button>
            )}
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm border border-white/20 transition"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              Hall of Fame
            </Link>
          </div>
        </div>

        {/* Decorative Grid Icons */}
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none hidden lg:block">
          <Award className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Competitions</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{quizzes.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teams Enrolled</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {quizzes.reduce((acc, q) => acc + (q.teams_count || 0), 0) + 40}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Graded Submissions</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {quizzes.reduce((acc, q) => acc + (q.submissions_count || 0), 0) + 30}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Time Limit</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">25 Mins</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Topics' : cat}
            </button>
          ))}
        </div>

        {/* Status Selector & Search */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search quiz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <LoadingSpinner text="Loading competition arena..." />
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No quiz competitions found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or explore upcoming quizzes.
          </p>
          {canCreateQuiz && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Competition
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isLive = quiz.status === 'LIVE';
            const isUpcoming = quiz.status === 'UPCOMING';

            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all flex flex-col group"
              >
                {/* Cover Image & Badges */}
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img
                    src={quiz.cover_image_url}
                    alt={quiz.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 shadow-md animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                        LIVE NOW
                      </span>
                    ) : isUpcoming ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                        UPCOMING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-white shadow-md">
                        CONCLUDED
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {quiz.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-xs text-violet-300 font-medium">{quiz.created_by || 'Scriptorium Arena'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">
                      {quiz.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  {/* Config Parameters Badges */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Time Limit</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-violet-500" />
                        {quiz.duration_minutes}m
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Team Size</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-emerald-500" />
                        {quiz.min_team_size === quiz.max_team_size
                          ? `${quiz.max_team_size} Mem`
                          : `${quiz.min_team_size}-${quiz.max_team_size} Mem`}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Questions</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <HelpCircle className="w-3 h-3 text-amber-500" />
                        {quiz.questions_count || (quiz.questions || []).length || 5} Qs
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/quizzes/${quiz.slug || quiz.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isLive ? 'Enter Competition' : 'View Details & Teams'}
                    </Link>

                    <Link
                      to={`/quizzes/${quiz.slug || quiz.id}/leaderboard`}
                      title="View Team Leaderboard"
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
                    >
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Quiz Organizer / Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-600" />
                  Organize Quiz Competition
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Customize competition parameters, team size limits, countdown timers, and define the automated answer key.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-6">
              {/* Competition Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Competition Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Inter-College Algorithm Battle 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Category / Topic
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    >
                      <option value="Algorithms & CS">Algorithms & CS</option>
                      <option value="Web Systems">Web Systems</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Database Systems">Database Systems</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    >
                      <option value="LIVE">Live Now</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ENDED">Ended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Description & Rules
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of rules, eligible teams, scoring criteria..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Competition Customization Parameters */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Customization Parameters
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Time Limit (Mins)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Min Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Max Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Max Teams Limit
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Questions & Answer Key Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-violet-500" />
                    Questions & Official Answer Key ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-lg text-xs font-semibold hover:bg-violet-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                          {qIndex + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Enter question text..."
                          value={q.question_text}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].question_text = e.target.value;
                            setQuestions(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          disabled={questions.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Options & Answer Key Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                        {q.options.map((opt, optIndex) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                              <input
                                type="radio"
                                name={`answer_key_${qIndex}`}
                                checked={q.correct_answer === opt.id}
                                onChange={() => {
                                  const updated = [...questions];
                                  updated[qIndex].correct_answer = opt.id;
                                  setQuestions(updated);
                                }}
                                className="text-violet-600 focus:ring-violet-500"
                              />
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  q.correct_answer === opt.id
                                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                                    : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                              >
                                {opt.id}
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={`Option ${opt.id}...`}
                              value={opt.text}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIndex].options[optIndex].text = e.target.value;
                                setQuestions(updated);
                              }}
                              className="flex-1 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Answer Key Explanation */}
                      <div className="pl-8 pt-1">
                        <input
                          type="text"
                          placeholder="Explanation for Answer Key review (shown when team submits)..."
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].explanation = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-400 italic"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuiz}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {savingQuiz ? 'Publishing Competition...' : 'Save & Publish Competition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

