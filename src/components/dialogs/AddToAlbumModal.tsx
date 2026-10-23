import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Plus } from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';

interface AddToAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateAlbum: () => void;
}

export const AddToAlbumModal: React.FC<AddToAlbumModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateAlbum,
}) => {
  const { albums, selectedIds, addMediaToAlbum } = useGallery();

  if (!isOpen) return null;

  const userAlbums = albums.filter((a) => !a.isSystem);

  const handleSelectAlbum = async (albumId: string) => {
    await addMediaToAlbum(albumId, Array.from(selectedIds));
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          className="w-full max-w-sm bg-white dark:bg-[#181b24] text-slate-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[75vh] flex flex-col pb-safe"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold">Add to Album</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-1">
            {/* Create new album shortcut */}
            <button
              onClick={() => {
                onClose();
                onOpenCreateAlbum();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left text-blue-600 dark:text-blue-400 font-medium text-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <span>Create New Album</span>
            </button>

            {/* List user albums */}
            {userAlbums.map((album) => (
              <button
                key={album.id}
                onClick={() => handleSelectAlbum(album.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100">
                    {album.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {album.itemCount} {album.itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </button>
            ))}

            {userAlbums.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                No custom albums created yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
