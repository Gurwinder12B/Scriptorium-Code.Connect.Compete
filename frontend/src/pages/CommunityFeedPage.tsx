import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { communityApi } from '../services/api';
import { Question, Tag } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import {
  Search,
  CheckCircle2,
  Eye,
  PlusCircle,
  Tag as TagIcon,
  Flame,
  Clock,
  HelpCircle,
} from 'lucide-react';

export const CommunityFeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('q') || '';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [qData, tagsData] = await Promise.all([
          communityApi.getQuestions({
            tag: currentTag,
            sort: currentSort,
            q: searchQuery,
          }),
          communityApi.getTags(),
        ]);
        setQuestions(qData);
        setTags(tagsData);
      } catch (err) {
        console.error('Failed to load community feed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentTag, currentSort, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInputValue.trim()) {
      params.set('q', searchInputValue.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
  };

  const handleTagFilter = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams);
    if (currentTag === tagSlug) {
      params.delete('tag');
    } else {
      params.set('tag', tagSlug);
    }
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {/* Header and Call to Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Developer Discussions
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ask technical questions, share architectural answers, and explore community knowledge.
          </p>
        </div>
        <Link
          to="/ask"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Ask Question
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Search & Sort Tabs */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between transition-colors">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                placeholder="Search discussions..."
                className="w-full pl-9 pr-3.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </form>

            {/* Sort Filter Tabs */}
            <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-slate-50 dark:bg-slate-950 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => handleSortChange('newest')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                  currentSort === 'newest'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Newest
              </button>
              <button
                onClick={() => handleSortChange('votes')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                  currentSort === 'votes'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Most Voted
              </button>
              <button
                onClick={() => handleSortChange('unanswered')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                  currentSort === 'unanswered'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Unanswered
              </button>
            </div>
          </div>

          {/* Active Tag Filter Indicator */}
          {currentTag && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-brand-50/60 dark:bg-brand-950/40 p-3 rounded-lg border border-brand-100 dark:border-brand-900">
              <span className="font-medium">Filtered by tag:</span>
              <Badge variant="purple">{currentTag}</Badge>
              <button
                onClick={() => handleTagFilter(currentTag)}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline ml-2 font-medium"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Feed Content */}
          {loading ? (
            <LoadingSpinner text="Loading discussions..." />
          ) : questions.length === 0 ? (
            <EmptyState
              title="No questions found"
              description="Be the first developer to ask a technical question in this topic!"
              actionText="Ask a Question"
              onAction={() => (window.location.href = '/ask')}
            />
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition hover:shadow-md flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  {/* Score & Answers Counters */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center sm:w-20 shrink-0 text-center gap-3 sm:gap-2 border-b sm:border-b-0 dark:border-slate-800 pb-3 sm:pb-0">
                    <div className="flex sm:flex-col items-center">
                      <span className="text-base font-bold text-slate-900 dark:text-white">{q.vote_count}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">votes</span>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                        q.is_solved
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : q.answer_count > 0
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {q.is_solved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{q.answer_count} ans</span>
                    </div>

                    <div className="hidden sm:flex items-center text-[11px] text-slate-400 gap-1">
                      <Eye className="w-3 h-3" />
                      {q.view_count}
                    </div>
                  </div>

                  {/* Question Title & Snippet */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/community/questions/${q.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition block mb-1.5"
                    >
                      {q.title}
                    </Link>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {q.content_markdown}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex flex-wrap gap-1.5">
                        {q.tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagFilter(tag.slug)}
                            className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition font-medium"
                          >
                            #{tag.name}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Link
                          to={`/profile/${q.author_username}`}
                          className="font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {q.author_username}
                        </Link>
                        <span>&bull;</span>
                        <span>{new Date(q.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Popular Tags & Community Guidelines */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Popular Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTagFilter(t.slug)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium flex items-center gap-1.5 ${
                    currentTag === t.slug
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[10px] opacity-75">({t.usage_count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 p-5 rounded-xl border border-brand-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Community Guidelines</h4>
            <p>1. Provide reproducible examples and code snippets.</p>
            <p>2. Keep discussions respectful and focused on technical learning.</p>
            <p>3. Accept helpful answers to reward peer contributors.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
