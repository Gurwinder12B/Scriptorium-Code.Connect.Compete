import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { problemsApi } from '../services/api';
import { Problem, ProblemDifficulty } from '../types';
import { useAuth } from '../context/AuthContext';
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
  Plus,
  X,
  FileCode2,
} from 'lucide-react';

export const ProblemLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const canAddProblem = Boolean(user && (user.role === 'admin' || user.role === 'developer'));

  const [searchParams, setSearchParams] = useSearchParams();
  const currentDiff = searchParams.get('difficulty') || '';
  const currentTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('q') || '';

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Add Problem Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('EASY');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [sampleExplanation, setSampleExplanation] = useState('');
  const [hiddenInput, setHiddenInput] = useState('');
  const [hiddenOutput, setHiddenOutput] = useState('');

  const loadProblems = async () => {
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
  };

  useEffect(() => {
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

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !descriptionMarkdown.trim()) {
      alert('Please fill out Problem Title and Description.');
      return;
    }

    setSaving(true);
    try {
      const tagsList = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const testCases: any[] = [];
      if (sampleInput || sampleOutput) {
        testCases.push({
          input_data: sampleInput,
          expected_output: sampleOutput,
          is_sample: true,
          is_hidden: false,
          explanation: sampleExplanation.trim() || undefined,
        });
      }
      if (hiddenInput || hiddenOutput) {
        testCases.push({
          input_data: hiddenInput,
          expected_output: hiddenOutput,
          is_sample: false,
          is_hidden: true,
        });
      }

      await problemsApi.createProblem({
        title: title.trim(),
        difficulty,
        description_markdown: descriptionMarkdown.trim(),
        input_format: inputFormat.trim() || undefined,
        output_format: outputFormat.trim() || undefined,
        constraints: constraints.trim() || undefined,
        tags: tagsList,
        test_cases: testCases,
      });

      setIsModalOpen(false);
      // Reset
      setTitle('');
      setDescriptionMarkdown('');
      setInputFormat('');
      setOutputFormat('');
      setConstraints('');
      setTagsInput('');
      setSampleInput('');
      setSampleOutput('');
      setSampleExplanation('');
      setHiddenInput('');
      setHiddenOutput('');

      await loadProblems();
      alert('Problem created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create problem.');
    } finally {
      setSaving(false);
    }
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

        {canAddProblem && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Problem
          </button>
        )}
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

      {/* Add Problem Modal (Developer & Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-brand-600" /> Create Coding Challenge
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Problem Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Invert Binary Tree"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Problem Description (Markdown) *</label>
                <textarea
                  required
                  rows={4}
                  value={descriptionMarkdown}
                  onChange={(e) => setDescriptionMarkdown(e.target.value)}
                  placeholder="Describe the problem, input format expectations, and algorithmic objective..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Input Format (Optional)</label>
                  <input
                    type="text"
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value)}
                    placeholder="e.g. First line contains integer N"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Output Format (Optional)</label>
                  <input
                    type="text"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    placeholder="e.g. Return root node of the inverted tree"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Constraints</label>
                  <input
                    type="text"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g. 1 <= nums.length <= 10^5"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Trees, Depth-First Search, Binary Tree"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Sample Test Case */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Sample Test Case (Visible to user)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    value={sampleInput}
                    onChange={(e) => setSampleInput(e.target.value)}
                    placeholder="Sample Input (e.g. [4,2,7,1,3,6,9])"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    value={sampleOutput}
                    onChange={(e) => setSampleOutput(e.target.value)}
                    placeholder="Sample Output (e.g. [4,7,2,9,6,3,1])"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  value={sampleExplanation}
                  onChange={(e) => setSampleExplanation(e.target.value)}
                  placeholder="Explanation (Optional)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Hidden Test Case */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Hidden Test Case (Evaluator only)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    value={hiddenInput}
                    onChange={(e) => setHiddenInput(e.target.value)}
                    placeholder="Hidden Input"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    value={hiddenOutput}
                    onChange={(e) => setHiddenOutput(e.target.value)}
                    placeholder="Hidden Output"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
