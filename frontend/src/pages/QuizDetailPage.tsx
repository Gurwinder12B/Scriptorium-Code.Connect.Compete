import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizzesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QuizItem, QuizTeam } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Trophy,
  Clock,
  Users,
  Play,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Layers,
  UserPlus,
  KeyRound,
  FileQuestion,
} from 'lucide-react';

export const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Team Registration Form State
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<Array<{ name: string; email: string }>>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'register' | 'join'>('register');
  const [registering, setRegistering] = useState(false);
  const [registeredTeam, setRegisteredTeam] = useState<QuizTeam | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await quizzesApi.getQuiz(id);
        setQuiz(data);

        // Check if current user already registered a team locally for this quiz
        try {
          const stored = localStorage.getItem(`scriptorium_my_team_${data.id}`);
          if (stored) {
            setRegisteredTeam(JSON.parse(stored));
          }
        } catch {}
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddMemberField = () => {
    if (!quiz) return;
    if (members.length + 1 >= quiz.max_team_size) {
      return alert(`Maximum team size for this quiz is ${quiz.max_team_size} members.`);
    }
    setMembers([...members, { name: '', email: '' }]);
  };

  const handleRemoveMemberField = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    if (!teamName.trim()) return alert('Please enter a team name.');

    const totalMembers = members.length + 1; // + 1 for leader
    if (totalMembers < quiz.min_team_size) {
      return alert(`This quiz requires a minimum of ${quiz.min_team_size} members.`);
    }

    setRegistering(true);
    try {
      const res = await quizzesApi.registerTeam(quiz.id, {
        team_name: teamName.trim(),
        members: members.filter((m) => m.name.trim()),
      });

      setRegisteredTeam(res);
      localStorage.setItem(`scriptorium_my_team_${quiz.id}`, JSON.stringify(res));
      alert(`Team "${res.name}" registered successfully! Join code: ${res.join_code}`);
    } catch (err: any) {
      alert(err.message || 'Team registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    if (!joinCodeInput.trim()) return alert('Please enter team join code.');

    setRegistering(true);
    try {
      const joinedTeam = await quizzesApi.joinTeam(quiz.id, joinCodeInput.trim());
      const teamObj: QuizTeam = joinedTeam?.id ? joinedTeam : {
        id: Date.now(),
        quiz_id: quiz.id,
        name: `Team ${joinCodeInput.trim()}`,
        join_code: joinCodeInput.trim(),
        leader_id: user?.id || 1,
        leader_name: user?.username || 'Team Leader',
        members: [{ name: user?.username || 'You', email: user?.email || '' }],
        member_count: 2,
        status: 'REGISTERED',
        created_at: new Date().toISOString(),
      };
      setRegisteredTeam(teamObj);
      localStorage.setItem(`scriptorium_my_team_${quiz.id}`, JSON.stringify(teamObj));
      alert('Joined team successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to join team.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading competition details..." />;
  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Competition Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          The requested quiz competition may have concluded or been removed.
        </p>
        <Link to="/quizzes" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">
          Return to Arena
        </Link>
      </div>
    );
  }

  const isLive = quiz.status === 'LIVE';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950 text-white">
        <div className="h-64 sm:h-72 w-full relative">
          <img src={quiz.cover_image_url} alt={quiz.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-600 text-white uppercase tracking-wider">
              {quiz.category}
            </span>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                LIVE ARENA
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                {quiz.status}
              </span>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-violet-300 font-semibold uppercase tracking-wider">
                Organized by {quiz.created_by || 'Scriptorium Technical Community'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">{quiz.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/quizzes/${quiz.slug || quiz.id}/leaderboard`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                Live Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Rules & Team Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-violet-600" />
              Competition Guidelines & Structure
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {quiz.description}
            </p>

            {/* Parameter Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="block text-[11px] text-slate-400 font-semibold uppercase">Duration</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-violet-500" />
                  {quiz.duration_minutes} Mins
                </span>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 font-semibold uppercase">Team Size</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-emerald-500" />
                  {quiz.min_team_size === quiz.max_team_size
                    ? `${quiz.max_team_size} Members`
                    : `${quiz.min_team_size}-${quiz.max_team_size} Members`}
                </span>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 font-semibold uppercase">Total Points</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  {quiz.total_points || 50} Pts
                </span>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 font-semibold uppercase">Passing Score</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4 text-blue-500" />
                  {quiz.passing_score || 30} Pts
                </span>
              </div>
            </div>

            {/* Answer Key & Evaluation Protocol */}
            <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 space-y-2">
              <h4 className="text-xs font-bold text-violet-900 dark:text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Automated Answer Key & Instant Scoring Protocol
              </h4>
              <p className="text-xs text-violet-800 dark:text-violet-200/90 leading-relaxed">
                When your team submits this competition, responses are graded immediately against the official instructor answer key. You will receive an instantaneous scorecard with your percentage, points awarded, and an itemized solution review explaining every question.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Team Management & Start Arena */}
        <div className="space-y-6">
          {/* Active Team Status Card */}
          {registeredTeam ? (
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  Enrolled Team
                </span>
                <span className="font-mono text-xs font-bold bg-slate-950/40 px-2 py-0.5 rounded">
                  Code: {registeredTeam.join_code}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold">{registeredTeam.name}</h3>
                <p className="text-xs text-violet-100 mt-1">
                  Leader: {registeredTeam.leader_name} • {registeredTeam.member_count} member(s)
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/quizzes/${quiz.slug || quiz.id}/live`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-2xl text-sm shadow-md transition transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  Launch Live Quiz Arena
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Tabs Card */
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeTab === 'register'
                      ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('join')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeTab === 'join'
                      ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Join via Code
                </button>
              </div>

              {activeTab === 'register' ? (
                <form onSubmit={handleRegisterTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ByteVanguard"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>

                  {/* Teammates */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Teammates (Up to {quiz.max_team_size - 1})
                      </label>
                      {members.length + 1 < quiz.max_team_size && (
                        <button
                          type="button"
                          onClick={handleAddMemberField}
                          className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" /> Add Member
                        </button>
                      )}
                    </div>

                    {members.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Teammate Name"
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...members];
                            updated[idx].name = e.target.value;
                            setMembers(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberField(idx)}
                          className="text-slate-400 hover:text-rose-500 text-xs font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                  >
                    {registering ? 'Registering Team...' : 'Register Team & Enter'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoinTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Team Join Code *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. BYTE2026"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                  >
                    {registering ? 'Joining Team...' : 'Join Team with Code'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Direct Play for Solo Participants */}
          {quiz.min_team_size === 1 && (
            <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solo competitors can dive straight into the live arena without forming a multi-member team.
              </p>
              <Link
                to={`/quizzes/${quiz.slug || quiz.id}/live`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl text-xs font-bold transition"
              >
                <Play className="w-3.5 h-3.5" />
                Compete Solo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

