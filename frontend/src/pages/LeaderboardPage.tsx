import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardApi } from '../services/api';
import { LeaderboardEntry } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Trophy, Medal, Award, Flame, User as UserIcon } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await leaderboardApi.getLeaderboard(50);
        setRankings(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mb-2">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Global Developer Leaderboard
        </h1>
        <p className="text-sm text-slate-500">
          Rankings are calculated from verified solved challenges and community answer contributions.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Calculating current standings..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4 w-20 text-center">Rank</th>
                  <th scope="col" className="px-6 py-4">Developer</th>
                  <th scope="col" className="px-6 py-4 text-center">Problems Solved</th>
                  <th scope="col" className="px-6 py-4 text-center">Answers</th>
                  <th scope="col" className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rankings.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  return (
                    <tr
                      key={entry.rank}
                      className={`hover:bg-slate-50/80 transition ${
                        entry.rank === 1
                          ? 'bg-amber-50/30'
                          : entry.rank === 2
                          ? 'bg-slate-50/50'
                          : entry.rank === 3
                          ? 'bg-amber-50/10'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-extrabold text-xs shadow-sm">
                            1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-extrabold text-xs shadow-sm">
                            2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold text-xs shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-sm">{entry.rank}</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/profile/${entry.username}`}
                          className="flex items-center space-x-3 group"
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-brand-600 transition">
                              {entry.full_name || entry.username}
                            </p>
                            <p className="text-xs text-slate-400">@{entry.username}</p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-center text-slate-700 font-semibold">
                        {entry.problems_solved_count}
                      </td>

                      <td className="px-6 py-4 text-center text-slate-500">
                        {entry.answers_count}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="font-extrabold text-brand-600 text-base">
                          {entry.points} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
