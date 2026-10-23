import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, FolderPlus, Heart, Trash2, X } from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';

interface SelectionActionBarProps {
  onOpenAddToAlbum: () => void;
}

export const SelectionActionBar: React.FC<SelectionActionBarProps> = ({ onOpenAddToAlbum }) => {
  const {
    isSelectionMode,
    selectedIds,
    deselectAll,
    moveToTrash,
    mediaList,
    showToast,
    toggleFavorite,
  } = useGallery();

  if (!isSelectionMode) return null;

  const count = selectedIds.size;
  const selectedItems = mediaList.filter((m) => selectedIds.has(m.id));

  // Web Share API handler
  const handleShare = async () => {
    if (count === 0) return;

    try {
      const filesToShare: File[] = [];
      for (const item of selectedItems) {
        if (item.blob) {
          filesToShare.push(new File([item.blob], item.name, { type: item.mimeType }));
        }
      }

      if (navigator.canShare && navigator.canShare({ files: filesToShare }) && filesToShare.length > 0) {
        await navigator.share({
          files: filesToShare,
          title: `Shared ${count} items from Gallery`,
        });
        showToast('Shared successfully', 'success');
      } else if (navigator.share) {
        await navigator.share({
          title: 'Gallery Media',
          text: `Selected ${count} photos from Gallery`,
        });
      } else {
        // Fallback: download the first selected item
        const first = selectedItems[0];
        if (first?.blob) {
          const url = URL.createObjectURL(first.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = first.name;
          a.click();
          URL.revokeObjectURL(url);
          showToast(`Downloaded ${first.name}`, 'info');
        } else {
          showToast('Sharing not supported on this browser', 'info');
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        showToast('Sharing failed', 'error');
      }
    }
  };

  const handleFavoriteAll = async () => {
    for (const id of selectedIds) {
      await toggleFavorite(id);
    }
    deselectAll();
  };

  const handleDeleteAll = async () => {
    if (count === 0) return;
    await moveToTrash(Array.from(selectedIds));
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#12141c]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-2xl transition-colors duration-200"
      >
        <div className="max-w-screen-md mx-auto flex items-center justify-around h-16 px-4">
          {/* Share */}
          <button
            onClick={handleShare}
            disabled={count === 0}
            className="flex flex-col items-center justify-center gap-1 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[11px] font-medium">Share</span>
          </button>

          {/* Add to Album */}
          <button
            onClick={onOpenAddToAlbum}
            disabled={count === 0}
            className="flex flex-col items-center justify-center gap-1 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            <span className="text-[11px] font-medium">Add to album</span>
          </button>

          {/* Favorite */}
          <button
            onClick={handleFavoriteAll}
            disabled={count === 0}
            className="flex flex-col items-center justify-center gap-1 text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-40 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[11px] font-medium">Favorite</span>
          </button>

          {/* Delete / Trash */}
          <button
            onClick={handleDeleteAll}
            disabled={count === 0}
            className="flex flex-col items-center justify-center gap-1 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-[11px] font-medium">Delete</span>
          </button>

          {/* Cancel */}
          <button
            onClick={() => deselectAll()}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-[11px] font-medium">Cancel</span>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
