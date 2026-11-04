import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, MessageSquare, Trophy, Terminal, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 pb-16 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Scriptorium v1.0 Released
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Code with precision. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-500">
              Connect with developers.
            </span> <br />
            Compete on the leaderboard.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SCRIPTORIUM combines a technical programming community with an isolated in-browser coding practice platform. Solve algorithms, ask questions, and build your developer portfolio.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/problems"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-500/25 transition gap-2"
            >
              Start Coding Practice
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-800 shadow-sm transition gap-2"
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Explore Discussions
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 pt-10 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Isolated Execution</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Python & JS</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Multi-Language Judge</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Real-Time</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Server-Verified Scoring</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Moderated</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Safe Peer Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Everything developers need in one place
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            No more switching between separate forum websites and practice sandboxes. Scriptorium integrates community discussions and code evaluation seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Technical Community</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Ask questions with Markdown code formatting, vote on the best answers, accept solutions, and discuss algorithms with fellow developers.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tag-based filtering</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tamper-proof voting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Author accepted answer badges</li>
            </ul>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Browser Code Editor</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Write solutions using Monaco Editor with full syntax highlighting, starter code templates, and isolated evaluation across test cases.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Private hidden test verification</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Memory & execution time limits</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant execution feedback</li>
            </ul>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verified Progress</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Earn difficulty points for solved challenges, track your progress breakdown by category, and climb the public leaderboard.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Easy / Medium / Hard points</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Anti-spam duplicate prevention</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Public developer portfolio</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
