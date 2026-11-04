import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import {
  Trophy,
  CheckCircle2,
  Code2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await usersApi.getDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your developer dashboard..." />;
  if (!dashboardData) return null;

  const stats = dashboardData.stats || {};
  const breakdown = stats.difficulty_breakdown || {};

  const easySolved = breakdown.easy?.solved || 0;
  const easyTotal = breakdown.easy?.total || 1;
  const medSolved = breakdown.medium?.solved || 0;
  const medTotal = breakdown.medium?.total || 1;
  const hardSolved = breakdown.hard?.solved || 0;
  const hardTotal = breakdown.hard?.total || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-brand-200">
            Developer Workspace
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
            Welcome back, {user?.username}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-brand-100 leading-relaxed">
            Track your coding practice progress, review submissions, and manage your community discussions.
          </p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Points</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.points || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problems Solved</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.solved_count || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions Asked</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.questions_count || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Answers Contributed</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.answers_count || 0}</p>
          </div>
        </div>
      </div>

      {/* Progress Breakdown & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Difficulty Progress Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" /> Problem Solving Progress
          </h2>

          <div className="space-y-4">
            {/* Easy Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700">Easy</span>
                <span className="text-slate-600">{easySolved} / {easyTotal}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((easySolved / (easyTotal || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Medium Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700">Medium</span>
                <span className="text-slate-600">{medSolved} / {medTotal}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((medSolved / (medTotal || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Hard Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700">Hard</span>
                <span className="text-slate-600">{hardSolved} / {hardTotal}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((hardSolved / (hardTotal || 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/problems"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-between"
            >
              <span>Explore more challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Columns: Recent Submissions History Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" /> Recent Submissions
            </h2>
            <Link to="/problems" className="text-xs text-brand-600 hover:underline font-semibold">
              Solve Problem
            </Link>
          </div>

          {(!dashboardData.recent_submissions || dashboardData.recent_submissions.length === 0) ? (
            <p className="text-xs text-slate-500 text-center py-10">
              No submissions recorded yet. Head over to the Problem Library to write your first solution!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs divide-y divide-slate-100">
                <thead className="text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5">Problem</th>
                    <th className="py-2.5">Language</th>
                    <th className="py-2.5">Verdict</th>
                    <th className="py-2.5 text-right">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {dashboardData.recent_submissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-900">
                        <Link to={`/problems/${sub.problem_id}`} className="hover:text-brand-600">
                          {sub.problem_title || `Problem #${sub.problem_id}`}
                        </Link>
                      </td>
                      <td className="py-2.5 text-slate-500">{sub.language}</td>
                      <td className="py-2.5">
                        <span
                          className={`font-semibold ${
                            sub.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500">
                        {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
