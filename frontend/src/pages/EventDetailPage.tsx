import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { EventItem, EventMediaItem, EventAlbum } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { MediaLightbox } from '../components/events/MediaLightbox';
import {
  Calendar,
  MapPin,
  Camera,
  ArrowLeft,
  Plus,
  Upload,
  Sparkles,
  Users,
  Trophy,
  Play,
  Film,
  FileText,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Album Filter
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'recap' | 'teams'>('photos');
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Media Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCredit, setUploadCredit] = useState(user?.username || '');
  const [uploadAlbumId, setUploadAlbumId] = useState<string>('');
  const [uploadMediaType, setUploadMediaType] = useState<'image' | 'video'>('image');
  const [externalUrl, setExternalUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Create Album Modal
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  const canManage = user && ['admin', 'moderator', 'club_coordinator'].includes(user.role);

  const loadEvent = async () => {
    if (!id) return;
    try {
      const data = await eventsApi.getEvent(id);
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading event memories and gallery..." />;
  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Event Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || 'This event might have been removed.'}</p>
        <Link to="/events" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold">
          Return to Event Media
        </Link>
      </div>
    );
  }

  // Filter media items
  const allMedia = event.media || [];
  const photos = allMedia.filter(
    (m) => m.media_type === 'image' && (!selectedAlbumId || m.album_id === selectedAlbumId)
  );
  const videos = allMedia.filter(
    (m) => (m.media_type === 'video' || m.media_type === 'external_video') && (!selectedAlbumId || m.album_id === selectedAlbumId)
  );

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleMediaUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile && !externalUrl) {
      alert('Please select a file or provide a video URL.');
      return;
    }

    setIsUploading(true);
    try {
      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        if (uploadAlbumId) formData.append('album_id', uploadAlbumId);
        if (uploadCaption) formData.append('caption', uploadCaption);
        if (uploadCredit) formData.append('photographer_credit', uploadCredit);
        formData.append('media_type', uploadMediaType);

        await eventsApi.uploadMedia(event.id, formData);
      } else {
        await eventsApi.uploadMedia(event.id, {
          media_url: externalUrl,
          media_type: uploadMediaType === 'video' ? 'external_video' : 'image',
          caption: uploadCaption,
          photographer_credit: uploadCredit,
          album_id: uploadAlbumId ? parseInt(uploadAlbumId, 10) : undefined,
        });
      }

      await loadEvent();
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setExternalUrl('');
      setUploadCaption('');
    } catch (err: any) {
      alert(err.message || 'Media upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;

    setCreatingAlbum(true);
    try {
      await eventsApi.createAlbum(event.id, {
        title: albumTitle.trim(),
        description: albumDescription.trim() || undefined,
      });
      await loadEvent();
      setIsAlbumModalOpen(false);
      setAlbumTitle('');
      setAlbumDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to create album.');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Are you sure you want to remove this media item?')) return;
    try {
      await eventsApi.deleteMedia(event.id, mediaId);
      await loadEvent();
    } catch (err: any) {
      alert(err.message || 'Failed to remove media.');
    }
  };

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Action controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Link>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAlbumModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              + Create Album
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Media
            </button>
          </div>
        )}
      </div>

      {/* Event Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl min-h-[320px] flex flex-col justify-end p-6 sm:p-10">
        <img
          src={event.cover_image_url}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-600 text-white shadow">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur border border-white/20 text-white">
              {event.organizing_club}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-brand-400" /> {formattedDate}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-brand-400" /> {event.location}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Camera className="w-4 h-4 text-brand-400" /> {allMedia.length} Photos & Videos
            </span>
          </div>

          <p className="text-sm text-slate-200/90 max-w-3xl leading-relaxed pt-2">
            {event.description}
          </p>

          {/* Event Highlights Badges */}
          {event.highlights && event.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {event.highlights.map((h, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Album Filter Bar */}
      {event.albums && event.albums.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Albums:</span>
          <button
            onClick={() => setSelectedAlbumId(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedAlbumId === null
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Media ({allMedia.length})
          </button>
          {event.albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                selectedAlbumId === album.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {album.title} ({album.media_count})
            </button>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" /> Photographs ({photos.length})
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" /> Videos ({videos.length})
        </button>

        {event.recap_markdown && (
          <button
            onClick={() => setActiveTab('recap')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'recap'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Event Recap & Story
          </button>
        )}

        {event.participating_teams && event.participating_teams.length > 0 && (
          <button
            onClick={() => setActiveTab('teams')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'teams'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" /> Winning Teams & Speakers ({event.participating_teams.length})
          </button>
        )}
      </div>

      {/* Tab 1: Photos Grid */}
      {activeTab === 'photos' && (
        <>
          {photos.length === 0 ? (
            <EmptyState
              title="No photographs in this album yet"
              description="Be the first to upload memories from this event."
              actionText={canManage ? "Upload Photo" : undefined}
              onAction={canManage ? () => setIsUploadModalOpen(true) : undefined}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenLightbox(index)}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer aspect-square"
                >
                  <img
                    src={item.thumbnail_url || item.media_url}
                    alt={item.caption || 'Event photo'}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                    {item.caption && (
                      <p className="text-xs font-semibold line-clamp-2 leading-snug">{item.caption}</p>
                    )}
                    {item.photographer_credit && (
                      <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                        <Camera className="w-3 h-3" /> {item.photographer_credit}
                      </p>
                    )}
                  </div>

                  {canManage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-rose-400 hover:bg-black/90 transition opacity-0 group-hover:opacity-100"
                      title="Delete photograph"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Videos Grid */}
      {activeTab === 'videos' && (
        <>
          {videos.length === 0 ? (
            <EmptyState
              title="No video recordings yet"
              description="Upload event recordings, teaser clips, or winning pitch presentations."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-3 p-4"
                >
                  <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
                    {vid.media_type === 'video' ? (
                      <video src={vid.media_url} controls className="w-full h-full object-contain" />
                    ) : (
                      <iframe
                        src={vid.media_url}
                        title={vid.caption || 'Event video'}
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    )}
                  </div>
                  {vid.caption && (
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {vid.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 3: Event Recap Story */}
      {activeTab === 'recap' && event.recap_markdown && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-4">
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {event.recap_markdown}
          </div>
        </div>
      )}

      {/* Tab 4: Winning Teams / Speakers */}
      {activeTab === 'teams' && event.participating_teams && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.participating_teams.map((team, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{team.name}</h3>
                {team.rank && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {team.rank}
                  </span>
                )}
              </div>
              {team.project && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Project: <strong className="text-slate-700 dark:text-slate-300">{team.project}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      <MediaLightbox
        items={photos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />

      {/* Upload Media Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-600" /> Add Event Media
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMediaUploadSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Target Album</label>
                <select
                  value={uploadAlbumId}
                  onChange={(e) => setUploadAlbumId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                >
                  <option value="">General Media</option>
                  {event.albums?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Media Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      checked={uploadMediaType === 'image'}
                      onChange={() => setUploadMediaType('image')}
                    />
                    Photograph
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      checked={uploadMediaType === 'video'}
                      onChange={() => setUploadMediaType('video')}
                    />
                    Video / Stream
                  </label>
                </div>
              </div>

              {/* File upload input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Upload File</label>
                <input
                  type="file"
                  accept={uploadMediaType === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-950/60 dark:file:text-brand-300"
                />
              </div>

              <div>
                <span className="block text-slate-400 text-[10px] text-center my-1 font-semibold">
                  — OR PROVIDE EXTERNAL URL —
                </span>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://youtube.com/embed/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Caption / Description</label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. Teams during the 2 AM coding sprint"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Photographer / Credit</label>
                <input
                  type="text"
                  value={uploadCredit}
                  onChange={(e) => setUploadCredit(e.target.value)}
                  placeholder="Photographer name or club"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Album</h2>
            <form onSubmit={handleCreateAlbumSubmit} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Album Title</label>
                <input
                  type="text"
                  required
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="e.g. Closing Ceremony & Awards"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="Short note about these photos..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAlbum}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
                >
                  {creatingAlbum ? 'Creating...' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
