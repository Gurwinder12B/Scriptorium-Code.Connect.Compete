import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizzesApi } from '../services/api';
import { QuizItem, QuizLeaderboardEntry } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Trophy,
  Medal,
  Clock,
  Search,
  ArrowRight,
  Award,
  Play,
  RotateCcw,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const QuizLeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const [quizData, lbData] = await Promise.all([
          quizzesApi.getQuiz(id),
          quizzesApi.getLeaderboard(Number(id) || 1),
        ]);
        setQuiz(quizData);
        setLeaderboard(Array.isArray(lbData) ? lbData : []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner text="Compiling live team rankings..." />;

  const filtered = leaderboard.filter((entry) =>
    entry.team_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-brand-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Official Standings
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Competition Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-violet-200">
            {quiz?.title || 'Scriptorium Tech Challenge'} • Ranked by Score & Submission Speed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/quizzes/${quiz?.slug || id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            Enter Quiz
          </Link>
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs border border-white/20 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Arena Lobby
          </Link>
        </div>
      </div>

      {/* Podium for Top 3 Teams */}
      {leaderboard.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
          {/* 2nd Place */}
          {top2 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 order-2 sm:order-1 sm:h-[220px] flex flex-col justify-end">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-sm flex items-center justify-center mx-auto shadow-inner">
                🥈 2
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                {top2.team_name}
              </h3>
              <p className="text-xl font-black text-violet-600 dark:text-violet-400">
                {top2.score} Pts <span className="text-xs text-slate-400 font-normal">({top2.percentage}%)</span>
              </p>
              <span className="text-[11px] text-slate-400">
                {Math.floor(top2.time_taken_seconds / 60)}m {top2.time_taken_seconds % 60}s
              </span>
            </div>
          )}

          {/* 1st Place */}
          {top1 && (
            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 p-6 rounded-3xl border-2 border-amber-400 shadow-lg text-center space-y-3 order-1 sm:order-2 sm:h-[250px] flex flex-col justify-end">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center mx-auto shadow-md">
                🏆 1
              </div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white line-clamp-1">
                {top1.team_name}
              </h3>
              <p className="text-2xl font-black text-amber-500">
                {top1.score} Pts <span className="text-xs text-slate-500 font-normal">({top1.percentage}%)</span>
              </p>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Champion • {Math.floor(top1.time_taken_seconds / 60)}m {top1.time_taken_seconds % 60}s
              </span>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 order-3 sm:order-3 sm:h-[200px] flex flex-col justify-end">
              <div className="w-10 h-10 rounded-full bg-amber-900/30 text-amber-700 dark:text-amber-400 font-extrabold text-sm flex items-center justify-center mx-auto">
                🥉 3
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                {top3.team_name}
              </h3>
              <p className="text-xl font-black text-violet-600 dark:text-violet-400">
                {top3.score} Pts <span className="text-xs text-slate-400 font-normal">({top3.percentage}%)</span>
              </p>
              <span className="text-[11px] text-slate-400">
                {Math.floor(top3.time_taken_seconds / 60)}m {top3.time_taken_seconds % 60}s
              </span>
            </div>
          )}
        </div>
      )}

      {/* Rankings Table & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            Full Team Rankings ({leaderboard.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No teams match your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4 text-center">Correct Answers</th>
                  <th className="py-3 px-4 text-right">Time Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filtered.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  return (
                    <tr
                      key={entry.submission_id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="py-3.5 px-6 text-center font-black">
                        {entry.rank === 1 ? (
                          <span className="text-amber-500 font-extrabold text-sm">🥇 1</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-slate-400 font-extrabold text-sm">🥈 2</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-700 font-extrabold text-sm">🥉 3</span>
                        ) : (
                          <span className="text-slate-500">{entry.rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {entry.team_name}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-violet-600 dark:text-violet-400">
                        {entry.score} / {entry.total_points}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {entry.percentage}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300">
                        {entry.correct_count} correct
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {Math.floor(entry.time_taken_seconds / 60)}m {entry.time_taken_seconds % 60}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

