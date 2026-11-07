import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { problemsApi } from '../services/api';
import { Problem, ProblemDifficulty } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import {
  Code2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Filter,
} from 'lucide-react';

export const ProblemLibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDiff = searchParams.get('difficulty') || '';
  const currentTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('q') || '';

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    async function loadProblems() {
      setLoading(true);
      try {
        const data = await problemsApi.getProblems({
          difficulty: currentDiff,
          tag: currentTag,
          q: searchQuery,
        });
        setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load problems:', err);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, [currentDiff, currentTag, searchQuery]);

  const handleDifficultyFilter = (diff: string) => {
    const params = new URLSearchParams(searchParams);
    if (!diff || currentDiff === diff) {
      params.delete('difficulty');
    } else {
      params.set('difficulty', diff);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Coding Problem Library
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Practice algorithmic challenges, test edge cases, and run your code against automated test cases.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Difficulty Filter Pills */}
        <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 p-1 rounded-lg bg-slate-50 dark:bg-slate-950 w-full md:w-auto">
          <button
            onClick={() => handleDifficultyFilter('')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              !currentDiff
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All Difficulties
          </button>
          <button
            onClick={() => handleDifficultyFilter('EASY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              currentDiff === 'EASY'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800'
                : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'
            }`}
          >
            Easy (10 pts)
          </button>
          <button
            onClick={() => handleDifficultyFilter('MEDIUM')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              currentDiff === 'MEDIUM'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-800'
                : 'text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400'
            }`}
          >
            Medium (20 pts)
          </button>
          <button
            onClick={() => handleDifficultyFilter('HARD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              currentDiff === 'HARD'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 shadow-sm border border-rose-200 dark:border-rose-800'
                : 'text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400'
            }`}
          >
            Hard (30 pts)
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems by title or topic..."
            className="w-full pl-9 pr-3.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>
      </div>

      {/* Problems Table */}
      {loading ? (
        <LoadingSpinner text="Loading problems..." />
      ) : (problems || []).length === 0 ? (
        <EmptyState
          title="No problems found"
          description="Try adjusting your difficulty filter or search query."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5 w-16 text-center">Status</th>
                  <th scope="col" className="px-6 py-3.5">Title</th>
                  <th scope="col" className="px-6 py-3.5">Difficulty</th>
                  <th scope="col" className="px-6 py-3.5">Acceptance</th>
                  <th scope="col" className="px-6 py-3.5">Topics</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {(problems || []).map((prob) => {
                  const isSolved = prob.user_status === 'SOLVED';
                  const isAttempted = prob.user_status === 'ATTEMPTED';

                  return (
                    <tr key={prob.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-center">
                        {isSolved ? (
                          <span title="Solved"><CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /></span>
                        ) : isAttempted ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mx-auto" title="Attempted" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition"
                        >
                          {prob.id}. {prob.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            prob.difficulty === 'EASY'
                              ? 'easy'
                              : prob.difficulty === 'MEDIUM'
                              ? 'medium'
                              : 'hard'
                          }
                        >
                          {prob.difficulty}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {prob.total_submissions > 0 ? `${prob.acceptance_rate}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {prob.tags?.map((t) => (
                            <span key={t.id} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:hover:bg-brand-600 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
                        >
                          Solve <Code2 className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
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
