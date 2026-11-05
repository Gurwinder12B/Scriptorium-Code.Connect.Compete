import React, { useEffect } from 'react';
import { EventMediaItem } from '../../types';
import { X, ChevronLeft, ChevronRight, Camera, Download, ExternalLink } from 'lucide-react';

interface MediaLightboxProps {
  items: EventMediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between text-white/80 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur border border-white/10">
            {currentIndex + 1} / {items.length}
          </span>
          {currentItem?.photographer_credit && (
            <span className="text-xs text-white/60 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Photo by <strong className="text-white/90">{currentItem.photographer_credit}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={currentItem?.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            title="Open original"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prev Navigation Button */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition hover:scale-110"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image or Video Container */}
      <div className="max-w-5xl max-h-[80vh] px-4 flex flex-col items-center justify-center select-none">
        {currentItem?.media_type === 'video' ? (
          <video
            src={currentItem.media_url}
            controls
            autoPlay
            className="max-h-[75vh] max-w-full rounded-xl shadow-2xl object-contain"
          />
        ) : (
          <img
            src={currentItem?.media_url}
            alt={currentItem?.caption || 'Event photograph'}
            className="max-h-[75vh] max-w-full rounded-xl shadow-2xl object-contain transition-transform"
          />
        )}

        {/* Caption */}
        {currentItem?.caption && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-center max-w-2xl">
            <p className="text-sm text-white/95 font-medium leading-relaxed">{currentItem.caption}</p>
          </div>
        )}
      </div>

      {/* Next Navigation Button */}
      {currentIndex < items.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition hover:scale-110"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
