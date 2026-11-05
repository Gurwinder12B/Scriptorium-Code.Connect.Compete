import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Code2,
  FolderGit2,
  ExternalLink,
  Github,
  Search,
  Plus,
  ThumbsUp,
  MessageSquareCode,
  Sparkles,
  Layers,
  Star,
  Users,
  CheckCircle,
  Tag,
  ArrowRight,
  Filter
} from 'lucide-react';
import { projectsApi, uploadApi } from '../services/api';
import { ProjectItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const CATEGORIES = [
  'All',
  'Artificial Intelligence',
  'DevOps & Tools',
  'Systems & Cloud',
  'Web Development',
  'Mobile Apps',
  'Game Development',
];

export const ProjectShowcasePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('q') || '';

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Submit Project Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Web Development');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newGithubUrl, setNewGithubUrl] = useState('');
  const [newLiveDemoUrl, setNewLiveDemoUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getProjects({
        category: currentCategory !== 'All' ? currentCategory : undefined,
        sort: currentSort,
        q: currentSearch || undefined,
        per_page: 24,
      });
      setProjects(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentCategory, currentSort, currentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('q', searchInput.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    setSearchParams(newParams);
  };

  const handleToggleUpvote = async (projectId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to upvote showcase projects.');
      return;
    }
    try {
      const res = await projectsApi.toggleUpvote(projectId);
      setProjects(prev =>
        prev.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              upvote_count: res.upvote_count,
              user_has_upvoted: res.user_has_upvoted,
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      alert(err.message || 'Upvote failed');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadRes = await uploadApi.uploadFile(file);
      setNewCoverUrl(uploadRes.url);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTagline.trim() || !newDescription.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const tagsArray = newTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await projectsApi.createProject({
        title: newTitle.trim(),
        tagline: newTagline.trim(),
        description_markdown: newDescription.trim(),
        category: newCategory,
        cover_image_url: newCoverUrl.trim() || undefined,
        github_url: newGithubUrl.trim() || undefined,
        live_demo_url: newLiveDemoUrl.trim() || undefined,
        tags: tagsArray,
      });

      setIsSubmitModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewTagline('');
      setNewDescription('');
      setNewCategory('Web Development');
      setNewCoverUrl('');
      setNewGithubUrl('');
      setNewLiveDemoUrl('');
      setNewTags('');

      await fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-800/[0.2] bg-[bottom_1px_center] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Developer Ecosystem Showcase</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Built by Students. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
              Reviewed by Peers.
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Showcase your hackathon creations, full-stack tools, and experimental codebases. Receive structured architectural feedback, optimization critiques, and security reviews from fellow developers.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in to submit your project.');
                } else {
                  setIsSubmitModalOpen(true);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-semibold text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Showcase Your Project</span>
            </Button>
            <a href="#browse-projects">
              <Button variant="outline" className="text-slate-300 border-slate-700 hover:bg-slate-800 text-sm">
                Explore Projects ({projects.length})
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div id="browse-projects" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  currentCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={currentSort}
              onChange={e => handleSortChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="upvoted">Most Upvoted</option>
              <option value="reviewed">Most Reviewed</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, stack, or description..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" text="Loading student showcase..." />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Be the first to submit an innovative project and receive structured feedback!"
          actionText="Showcase Your Project"
          onAction={() => setIsSubmitModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition duration-200 flex flex-col overflow-hidden group"
            >
              {/* Cover Image / Thumbnail */}
              <Link to={`/projects/${project.slug || project.id}`} className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden block">
                {project.cover_image_url ? (
                  <img
                    src={project.cover_image_url}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-gradient-to-tr from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40">
                    <FolderGit2 className="w-12 h-12 mb-2 stroke-1 text-indigo-400" />
                    <span className="text-xs font-medium">Scriptorium Project</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                    {project.category}
                  </span>
                </div>
              </Link>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Link
                    to={`/projects/${project.slug || project.id}`}
                    className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {project.title}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {project.tagline}
                  </p>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.slice(0, 4).map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        #{tag.name}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{project.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Meta & Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  {/* Author Attribution */}
                  <Link
                    to={`/profile/${project.author?.username}`}
                    className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold flex items-center justify-center text-[10px]">
                      {project.author?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium truncate max-w-[100px]">
                      @{project.author?.username}
                    </span>
                  </Link>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-3">
                    {/* Reviews Count Pill */}
                    <Link
                      to={`/projects/${project.slug || project.id}#reviews`}
                      className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      title="Peer Code Reviews"
                    >
                      <MessageSquareCode className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{project.review_count}</span>
                    </Link>

                    {/* Upvote Pill */}
                    <button
                      onClick={e => handleToggleUpvote(project.id, e)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        project.user_has_upvoted
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={project.user_has_upvoted ? 'Remove Upvote' : 'Upvote Project'}
                    >
                      <ThumbsUp className={`w-3 h-3 ${project.user_has_upvoted ? 'fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400' : ''}`} />
                      <span>{project.upvote_count}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Submit New Project */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderGit2 className="w-6 h-6 text-indigo-500" />
                  Showcase Your Project
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Share your software creation with the Scriptorium student developer community.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NeuralFlow Synthesizer"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Short Pitch *
                </label>
                <input
                  type="text"
                  required
                  placeholder="One sentence explaining what it does and why it's cool..."
                  value={newTagline}
                  onChange={e => setNewTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Technologies / Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, PyTorch, WebSockets, Go"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub / Source Repository URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={newGithubUrl}
                    onChange={e => setNewGithubUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo / Web Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://myproject.app"
                    value={newLiveDemoUrl}
                    onChange={e => setNewLiveDemoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Cover Image Upload / URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL or upload file..."
                    value={newCoverUrl}
                    onChange={e => setNewCoverUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition border border-slate-300 dark:border-slate-700">
                    {uploadingImage ? 'Uploading...' : 'Browse Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Project Story (Markdown) *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Explain why you built this project, architectural decisions, performance challenges solved, and future roadmap..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {submitting ? 'Publishing...' : 'Publish to Showcase'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectShowcasePage;
