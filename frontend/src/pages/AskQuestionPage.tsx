import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../services/api';
import { Tag } from '../types';
import { AlertCircle, Plus, X, HelpCircle, Eye, Edit3 } from 'lucide-react';

export const AskQuestionPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTags() {
      try {
        const data = await communityApi.getTags();
        setAvailableTags(data);
      } catch (err) {
        console.error('Failed to load tags:', err);
      }
    }
    loadTags();
  }, []);

  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleaned) return;
    if (selectedTags.includes(cleaned)) return;
    if (selectedTags.length >= 5) {
      alert('You can attach at most 5 tags per question.');
      return;
    }
    setSelectedTags([...selectedTags, cleaned]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters long.');
      return;
    }
    if (contentMarkdown.trim().length < 20) {
      setError('Question body must be at least 20 characters long.');
      return;
    }
    if (selectedTags.length === 0) {
      setError('Please add at least 1 topic tag.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const created = await communityApi.createQuestion({
        title: title.trim(),
        content_markdown: contentMarkdown.trim(),
        tags: selectedTags,
      });
      navigate(`/community/questions/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to publish question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ask a Technical Question
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Be specific, share what you've tried, and provide formatted code snippets.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Title <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500">
            Imagine asking your question to another developer. Keep it descriptive and concise.
          </p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How to prevent memory leaks when using closures in Node.js event listeners?"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
          />
        </div>

        {/* Markdown Content Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-bold text-slate-900">
                Detailed Explanation & Code <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500">
                Provide background context and paste minimal reproducible code examples.
              </p>
            </div>
            {/* Write / Preview Tab */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  !isPreview ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Write
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  isPreview ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
          </div>

          {!isPreview ? (
            <textarea
              rows={12}
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              placeholder="Describe your question in detail...&#10;&#10;```python&#10;# Paste code snippet here&#10;def example():&#10;    pass&#10;```"
              required
              className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm leading-relaxed"
            />
          ) : (
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 min-h-[300px] text-sm whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
              {contentMarkdown || <span className="text-slate-400 italic">No content to preview yet.</span>}
            </div>
          )}
        </div>

        {/* Tags Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="block text-sm font-bold text-slate-900">
            Tags (up to 5) <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500">
            Add tags to help other programmers find and answer your question.
          </p>

          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
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
              placeholder="Type tag name and press Enter (e.g. python, algorithms)..."
              className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
            >
              Add Tag
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs text-slate-400">Suggestions:</span>
            {availableTags.slice(0, 8).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAddTag(t.slug)}
                className="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                +{t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Question'}
          </button>
        </div>
      </form>
    </div>
  );
};
