import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';
import { MediaThumbnail } from '../gallery/MediaThumbnail';

interface RecentlyDeletedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecentlyDeletedModal: React.FC<RecentlyDeletedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { trashedList, restoreFromTrash, deletePermanently, emptyTrash } = useGallery();

  if (!isOpen) return null;

  const handleEmptyTrash = async () => {
    if (trashedList.length === 0) return;
    if (window.confirm('Empty trash permanently? This will remove all trashed items from the app.')) {
      await emptyTrash();
    }
  };

  const handleRestoreAll = async () => {
    const ids = trashedList.map((t) => t.id);
    await restoreFromTrash(ids);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-lg bg-white dark:bg-[#181b24] text-slate-900 dark:text-white rounded-none sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 h-full sm:h-[85vh] flex flex-col pb-safe"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold">Recently Deleted</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Honest Semantics Banner */}
          <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Imported photos will be removed from app storage. For referenced device folders,
              records are hidden from your gallery without altering external device files.
            </p>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto py-2">
            {trashedList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Trash2 className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                <p className="text-sm font-medium">Trash is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  Deleted photos and videos will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                {trashedList.map((item, idx) => (
                  <div key={item.id} className="relative group">
                    <MediaThumbnail item={item} index={idx} allMedia={trashedList} />
                    <button
                      onClick={() => restoreFromTrash([item.id])}
                      className="absolute top-1 left-1 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-sm transition-colors"
                      title="Restore item"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePermanently([item.id])}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                      title="Delete permanently"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          {trashedList.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleRestoreAll}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore All</span>
              </button>

              <button
                onClick={handleEmptyTrash}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
