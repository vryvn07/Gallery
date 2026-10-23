import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, Check, AlertCircle } from 'lucide-react';
import type { MediaItem } from '../../types/media';
import { useGallery } from '../../context/GalleryContext';

interface MediaThumbnailProps {
  item: MediaItem;
  index: number;
  allMedia: MediaItem[];
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ item, index, allMedia }) => {
  const {
    isSelectionMode,
    selectedIds,
    toggleSelect,
    openViewer,
    setIsSelectionMode,
  } = useGallery();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSelected = selectedIds.has(item.id);

  useEffect(() => {
    let url: string | null = null;
    const blobToUse = item.thumbnailBlob || item.blob;

    if (blobToUse) {
      url = URL.createObjectURL(blobToUse);
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [item.thumbnailBlob, item.blob]);

  // Touch handlers for mobile long-press selection
  const handleTouchStart = () => {
    if (isSelectionMode) return;
    longPressTimer.current = setTimeout(() => {
      setIsSelectionMode(true);
      toggleSelect(item.id);
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectionMode) {
      toggleSelect(item.id);
    } else {
      openViewer(index, allMedia);
    }
  };

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative aspect-square w-full overflow-hidden select-none cursor-pointer bg-slate-100 dark:bg-slate-800 transition-all duration-150 group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 scale-[0.96]' : ''
      }`}
    >
      {/* Media Image / Thumbnail */}
      {imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isSelected ? 'brightness-90' : 'group-hover:scale-105'
          }`}
        />
      ) : hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800">
          <AlertCircle className="w-6 h-6 mb-1 text-slate-400" />
          <span className="text-[10px] text-center truncate max-w-full px-1">{item.name}</span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 animate-pulse" />
      )}

      {/* Video Badge */}
      {item.type === 'video' && (
        <div className="absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium tracking-tight">
          <Play className="w-2.5 h-2.5 fill-white" />
          <span>{formatDuration(item.duration)}</span>
        </div>
      )}

      {/* Favorite Heart Badge */}
      {item.isFavorite && (
        <div className="absolute bottom-1 left-1 p-1 rounded-md bg-black/40 backdrop-blur-sm">
          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
        </div>
      )}

      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute top-1.5 right-1.5">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-150 ${
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-black/30 border-white/80 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      )}
    </div>
  );
};
