import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2, Edit2, Plus, ArrowLeft } from 'lucide-react';
import { db } from '../../services/storage/database';
import { useGallery } from '../../context/GalleryContext';
import { PhotosGrid } from '../gallery/PhotosGrid';
import type { MediaItem } from '../../types/media';

interface AlbumDetailViewProps {
  albumId: string;
  onOpenAddPhotos: () => void;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ albumId, onOpenAddPhotos }) => {
  const { albums, setActiveAlbumId, renameAlbum, deleteAlbum } = useGallery();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');

  const currentAlbum = albums.find((a) => a.id === albumId);

  // Live query for media in this album
  const albumMedia = useLiveQuery(async () => {
    if (!currentAlbum) return [];

    if (currentAlbum.isSystem) {
      switch (currentAlbum.systemType) {
        case 'videos':
          return db.media.where('type').equals('video').and((m) => !m.isTrash).reverse().sortBy('captureDate');
        case 'favorites':
          return db.media.where('isFavorite').equals(1).and((m) => !m.isTrash).reverse().sortBy('captureDate');
        case 'screenshots':
          return db.media.filter((m) => !m.isTrash && (m.name.toLowerCase().includes('screenshot') || (m.relativePath || '').toLowerCase().includes('screenshot'))).reverse().sortBy('captureDate');
        case 'camera':
          return db.media.filter((m) => !m.isTrash && ((m.folderName || '').toLowerCase().includes('camera') || (m.relativePath || '').toLowerCase().includes('dcim'))).reverse().sortBy('captureDate');
        case 'downloads':
          return db.media.filter((m) => !m.isTrash && (m.folderName || '').toLowerCase().includes('download')).reverse().sortBy('captureDate');
        case 'recent':
        case 'all':
        default:
          return db.media.where('isTrash').equals(0).reverse().sortBy('captureDate');
      }
    }

    // User album: query via albumMedia junction table
    const links = await db.albumMedia.where('albumId').equals(albumId).toArray();
    const mediaIds = links.map((l) => l.mediaId);
    if (mediaIds.length === 0) return [];

    const items = await db.media.where('id').anyOf(mediaIds).and((m) => !m.isTrash).toArray();
    return items.sort((a, b) => b.captureDate - a.captureDate);
  }, [albumId, currentAlbum]);

  if (!currentAlbum) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-slate-500">
        Album not found
      </div>
    );
  }

  const handleStartRename = () => {
    setRenameText(currentAlbum.title);
    setIsRenaming(true);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (renameText.trim()) {
      await renameAlbum(currentAlbum.id, renameText.trim());
      setIsRenaming(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (window.confirm(`Delete album "${currentAlbum.title}"? Your photos and videos will remain safe in the gallery.`)) {
      await deleteAlbum(currentAlbum.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-24">
      {/* Subheader Toolbar */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-[#151720] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-colors">
        <div className="flex-1 min-w-0 pr-2">
          {isRenaming ? (
            <form onSubmit={handleSaveRename} className="flex items-center gap-2">
              <input
                type="text"
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                autoFocus
                className="px-2.5 py-1 text-sm bg-white dark:bg-slate-800 border border-blue-500 rounded-lg text-slate-900 dark:text-white outline-none"
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white truncate">
                  {currentAlbum.title}
                </span>
                {!currentAlbum.isSystem && (
                  <button
                    onClick={handleStartRename}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Rename album"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {albumMedia?.length || 0} {albumMedia?.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          )}
        </div>

        {/* User Album Actions */}
        {!currentAlbum.isSystem && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddPhotos}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              onClick={handleDeleteAlbum}
              className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete album"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Album Photos Grid */}
      <PhotosGrid
        media={albumMedia || []}
        emptyMessage="This album is empty"
        emptySubtext="Add photos from your gallery into this album to keep them organized."
      />
    </div>
  );
};
