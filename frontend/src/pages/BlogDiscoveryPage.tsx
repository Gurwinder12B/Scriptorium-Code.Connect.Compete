import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogsApi } from '../services/api';
import { BlogPostItem, BlogCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import {
  BookOpen,
  PenTool,
  Search,
  Clock,
  Heart,
  MessageSquare,
  Sparkles,
  Calendar,
  Flame,
  TrendingUp,
  Award,
  ArrowRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const BlogDiscoveryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('q') || '';

  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  const isEditor = user && ['admin', 'moderator', 'editor'].includes(user.role);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [postsData, categoriesData] = await Promise.all([
          blogsApi.getBlogs({
            category: currentCategory,
            sort: currentSort,
            q: currentSearch,
            per_page: 20,
          }),
          blogsApi.getCategories().catch(() => []),
        ]);
        setPosts(postsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentCategory, currentSort, currentSearch]);

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (!slug || currentCategory === slug) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    setSearchParams(params);
  };

  const handleSortChange = (sortVal: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortVal);
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

  const featuredPost = posts.find((p) => p.is_featured);
  const regularPosts = posts.filter((p) => !featuredPost || p.id !== featuredPost.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 p-8 sm:p-12 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Student Technical Writing & Insights
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Learn, Share, and Publish with Fellow Developers
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Explore peer-reviewed tutorials, architecture deep dives, algorithmic mental models, and career experiences written by university developers.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/blogs/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition hover:scale-105"
            >
              <PenTool className="w-4 h-4" /> Write an Article
            </Link>

            {isEditor && (
              <Link
                to="/blogs/editorial"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
              >
                <Calendar className="w-4 h-4" /> Editorial Calendar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
            !currentCategory
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
              currentCategory === cat.slug
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{cat.name}</span>
            {cat.posts_count > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {cat.posts_count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Sort Pills */}
        <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 p-1 rounded-xl bg-slate-50 dark:bg-slate-950 w-full md:w-auto text-xs font-semibold">
          <button
            onClick={() => handleSortChange('newest')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentSort === 'newest'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => handleSortChange('popular')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              currentSort === 'popular'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular
          </button>
          <button
            onClick={() => handleSortChange('discussed')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              currentSort === 'discussed'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Most Discussed
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles by title, topic..."
            className="w-full pl-9 pr-3.5 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>
      </div>

      {/* Featured Spotlight Card */}
      {featuredPost && !currentSearch && !currentCategory && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 group">
          <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto overflow-hidden bg-slate-950 relative">
            <img
              src={featuredPost.cover_image_url}
              alt={featuredPost.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Featured Article
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {featuredPost.category && (
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    {featuredPost.category.name}
                  </span>
                )}
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {featuredPost.reading_time_minutes} min read
                </span>
              </div>

              <Link
                to={`/blogs/${featuredPost.slug || featuredPost.id}`}
                className="block text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition leading-tight"
              >
                {featuredPost.title}
              </Link>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <Link
                to={`/profile/${featuredPost.author?.username}`}
                className="flex items-center gap-2.5 group/author"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                  {featuredPost.author?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white group-hover/author:text-brand-600">
                    {featuredPost.author?.full_name || featuredPost.author?.username}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>

              <Link
                to={`/blogs/${featuredPost.slug || featuredPost.id}`}
                className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400"
              >
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Articles Grid */}
      {loading ? (
        <LoadingSpinner text="Loading technical articles..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Try selecting a different topic category or adjusting your search keywords."
          actionText="Write First Article"
          onAction={() => (window.location.href = '/blogs/write')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex gap-1.5">
                  {post.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white shadow">
                      {post.category.name}
                    </span>
                  )}
                  {post.is_editors_pick && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow flex items-center gap-1">
                      <Award className="w-3 h-3" /> Editor's Pick
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 text-white text-[11px] font-medium bg-black/60 px-2 py-0.5 rounded backdrop-blur flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.reading_time_minutes} min read
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Link
                    to={`/blogs/${post.slug || post.id}`}
                    className="block text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition leading-snug line-clamp-2"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <Link
                    to={`/profile/${post.author?.username}`}
                    className="flex items-center gap-2 group/author truncate max-w-[140px]"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-slate-200 dark:border-slate-700">
                      {post.author?.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover/author:text-brand-600 truncate">
                      {post.author?.full_name || post.author?.username}
                    </span>
                  </Link>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> {post.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-blue-500" /> {post.comment_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {post.view_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
