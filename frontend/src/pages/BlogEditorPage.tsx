import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { blogsApi, uploadApi } from '../services/api';
import { BlogCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  PenTool,
  Eye,
  Edit3,
  Image,
  Upload,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
  Code,
  Bold,
  Italic,
  List,
  Heading,
  Quote,
  Table,
} from 'lucide-react';

export const BlogEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live estimated reading time
  const readingTime = Math.max(1, Math.ceil(contentMarkdown.split(/\s+/).filter(Boolean).length / 200));

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const cats = await blogsApi.getCategories();
        setCategories(cats || []);
        if (cats && cats.length > 0) {
          setCategoryId(String(cats[0].id));
        }

        if (id) {
          const post = await blogsApi.getBlog(id);
          setTitle(post.title);
          setExcerpt(post.excerpt);
          setContentMarkdown(post.content_markdown || '');
          if (post.category) setCategoryId(String(post.category.id));
          if (post.tags) setSelectedTags(post.tags.map((t: any) => t.name));
          setCoverImageUrl(post.cover_image_url || '');
        }
      } catch (err) {
        console.error('Failed to initialize editor:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleaned) return;
    if (selectedTags.includes(cleaned)) return;
    if (selectedTags.length >= 5) {
      alert('Maximum 5 tags allowed per article.');
      return;
    }
    setSelectedTags([...selectedTags, cleaned]);
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== t));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    setContentMarkdown((prev) => `${prev}\n${prefix}Content${suffix}\n`);
  };

  const handleSubmit = async (targetStatus: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED') => {
    if (title.trim().length < 5) {
      alert('Article title must be at least 5 characters.');
      return;
    }
    if (contentMarkdown.trim().length < 20) {
      alert('Article body must be at least 20 characters.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content_markdown: contentMarkdown.trim(),
        category_id: categoryId ? parseInt(categoryId, 10) : undefined,
        tags: selectedTags,
        cover_image_url: coverImageUrl.trim() || undefined,
        status: targetStatus,
      };

      if (id) {
        await blogsApi.updateBlog(parseInt(id, 10), payload);
        navigate(`/blogs/${id}`);
      } else {
        const created = await blogsApi.createBlog(payload);
        navigate(`/blogs/${created.slug || created.id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading editor..." />;

  const isEditor = user && ['admin', 'moderator', 'editor'].includes(user.role);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Exit
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" /> ~{readingTime} min read
          </span>
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(isEditor ? 'PUBLISHED' : 'PENDING_REVIEW')}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition disabled:opacity-50"
          >
            {saving
              ? 'Publishing...'
              : isEditor
              ? 'Publish Now'
              : 'Submit for Review'}
          </button>
        </div>
      </div>

      {/* Editor Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title..."
            className="w-full text-2xl sm:text-3xl font-extrabold bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 pb-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Category & Cover URL Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              Topic Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>
        </div>

        {/* Short Excerpt */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Short Summary / Excerpt
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short 1-2 sentence preview for feed cards..."
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
          />
        </div>

        {/* Markdown Editor Toolbar & Dual-Tab View */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {/* Quick Markdown Formatting Controls */}
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-xs">
              <button
                type="button"
                onClick={() => insertMarkdown('## ')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Heading"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('```python\n# Code\n```')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('> ')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('| Col 1 | Col 2 |\n|---|---|\n| Val 1 | Val 2 |')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Table"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>

            {/* Write vs Preview Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  !isPreview
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Write
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  isPreview
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
          </div>

          {!isPreview ? (
            <textarea
              rows={16}
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              placeholder="Write your article in Markdown...&#10;&#10;## Introduction&#10;Share your thoughts and explanations...&#10;&#10;```python&#10;def solution():&#10;    pass&#10;```"
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          ) : (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 min-h-[360px] text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans prose prose-slate dark:prose-invert max-w-none">
              {contentMarkdown || <span className="text-slate-400 italic">No content to preview.</span>}
            </div>
          )}
        </div>

        {/* Tags Selector */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Tags (up to 5)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-brand-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              placeholder="Type tag and press Enter (e.g. python, algorithms)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Add Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
