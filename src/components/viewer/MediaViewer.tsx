import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Edit3,
  Trash2,
  Info,
  RotateCw,
  X,
} from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';
import { VideoPlayer } from './VideoPlayer';
import { MediaInfoModal } from './MediaInfoModal';

export const MediaViewer: React.FC = () => {
  const {
    activeViewerIndex,
    viewerList,
    closeViewer,
    openViewer,
    toggleFavorite,
    moveToTrash,
    openEditor,
    openDetails,
    detailsItem,
    closeDetails,
    showToast,
  } = useGallery();

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [showBars, setShowBars] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const currentItem =
    activeViewerIndex !== null && viewerList[activeViewerIndex]
      ? viewerList[activeViewerIndex]
      : null;

  // Create Object URL for current media item (original blob or thumbnail)
  useEffect(() => {
    if (!currentItem) {
      setMediaUrl(null);
      return;
    }

    let url: string | null = null;
    const blobToUse = currentItem.blob || currentItem.thumbnailBlob;

    if (blobToUse) {
      url = URL.createObjectURL(blobToUse);
      setMediaUrl(url);
    } else {
      setMediaUrl(null);
    }

    // Reset zoom and rotation on item change
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
    setRotationAngle(0);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [currentItem]);

  // Navigate next / previous
  const goNext = useCallback(() => {
    if (activeViewerIndex === null || activeViewerIndex >= viewerList.length - 1) return;
    openViewer(activeViewerIndex + 1, viewerList);
  }, [activeViewerIndex, viewerList, openViewer]);

  const goPrev = useCallback(() => {
    if (activeViewerIndex === null || activeViewerIndex <= 0) return;
    openViewer(activeViewerIndex - 1, viewerList);
  }, [activeViewerIndex, viewerList, openViewer]);

  // Keyboard navigation
  useEffect(() => {
    if (activeViewerIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') closeViewer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeViewerIndex, goNext, goPrev, closeViewer]);

  if (activeViewerIndex === null || !currentItem) {
    return null;
  }

  // Double tap to zoom handler
  const handleImageTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeSinceLastTap < 300) {
      // Double tap detected!
      if (zoomScale > 1) {
        setZoomScale(1);
        setPanPos({ x: 0, y: 0 });
      } else {
        setZoomScale(2.5);
      }
    } else {
      // Single tap toggles chrome toolbars
      setShowBars((prev) => !prev);
    }
  };

  // Touch swipe detection for next / previous
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || zoomScale > 1) return;

    const touchEnd = e.changedTouches[0];
    const diffX = touchEnd.clientX - touchStartRef.current.x;
    const diffY = touchEnd.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Detect horizontal swipe
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5 && duration < 350) {
      if (diffX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartRef.current = null;
  };

  const handleShare = async () => {
    if (!currentItem) return;

    try {
      if (currentItem.blob && navigator.canShare && navigator.canShare({ files: [new File([currentItem.blob], currentItem.name)] })) {
        await navigator.share({
          files: [new File([currentItem.blob], currentItem.name, { type: currentItem.mimeType })],
          title: currentItem.name,
        });
        showToast('Shared successfully', 'success');
      } else if (navigator.share) {
        await navigator.share({
          title: currentItem.name,
          text: `Photo from Gallery: ${currentItem.name}`,
        });
      } else if (mediaUrl) {
        const a = document.createElement('a');
        a.href = mediaUrl;
        a.download = currentItem.name;
        a.click();
        showToast('Downloaded to device', 'info');
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        showToast('Sharing failed', 'error');
      }
    }
  };

  const handleRotateQuick = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  const handleDeleteCurrent = async () => {
    if (!currentItem) return;
    await moveToTrash([currentItem.id]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar */}
      <AnimatePresence>
        {showBars && (
          <motion.header
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.15 }}
            className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-safe text-white"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={closeViewer}
                className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-sm font-medium text-white/90 truncate max-w-[200px]">
                {activeViewerIndex + 1} / {viewerList.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openDetails(currentItem)}
                className="p-2 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                aria-label="Details"
                title="View photo details"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <div
        className="flex-1 w-full h-full flex items-center justify-center relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentItem.type === 'video' && mediaUrl ? (
          <VideoPlayer src={mediaUrl} />
        ) : mediaUrl ? (
          <motion.div
            className="w-full h-full flex items-center justify-center p-0 sm:p-2 cursor-grab active:cursor-grabbing"
            onClick={handleImageTap}
            animate={{
              scale: zoomScale,
              rotate: rotationAngle,
              x: panPos.x,
              y: panPos.y,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            drag={zoomScale > 1}
            dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
            onDragEnd={(_, info) => {
              setPanPos((prev) => ({
                x: prev.x + info.offset.x,
                y: prev.y + info.offset.y,
              }));
            }}
          >
            <img
              src={mediaUrl}
              alt={currentItem.name}
              className="max-h-full max-w-full object-contain pointer-events-none"
            />
          </motion.div>
        ) : (
          <div className="text-white/60 text-sm">Loading media...</div>
        )}

        {/* Previous / Next Desktop chevron buttons */}
        {activeViewerIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-sm"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {activeViewerIndex < viewerList.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-sm"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Control Toolbar */}
      <AnimatePresence>
        {showBars && (
          <motion.footer
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-around px-4 h-16 bg-gradient-to-t from-black/85 via-black/50 to-transparent pb-safe text-white"
          >
            {/* Favorite toggle */}
            <button
              onClick={() => toggleFavorite(currentItem.id)}
              className="p-2.5 rounded-full hover:bg-white/20 transition-colors"
              title="Favorite"
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-5 h-5 ${
                  currentItem.isFavorite
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-white/90 hover:text-white'
                }`}
              />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              title="Share"
              aria-label="Share photo"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Edit (for images) */}
            {currentItem.type === 'image' && (
              <button
                onClick={() => openEditor(currentItem)}
                className="p-2.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Edit"
                aria-label="Edit photo"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}

            {/* Quick Rotate */}
            {currentItem.type === 'image' && (
              <button
                onClick={handleRotateQuick}
                className="p-2.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Rotate"
                aria-label="Rotate photo"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            )}

            {/* Delete / Trash */}
            <button
              onClick={handleDeleteCurrent}
              className="p-2.5 rounded-full hover:bg-white/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Move to trash"
              aria-label="Move to trash"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Details Sheet Modal */}
      <MediaInfoModal item={detailsItem} onClose={closeDetails} />
    </div>
  );
};
