import React from 'react';
import {
  CheckSquare,
  X,
  RefreshCw,
  Plus,
  ChevronLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';

interface AppHeaderProps {
  onOpenCreateAlbum?: () => void;
  onOpenAddPhotosToAlbum?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenCreateAlbum,
  onOpenAddPhotosToAlbum,
}) => {
  const {
    activeTab,
    activeAlbumId,
    setActiveAlbumId,
    albums,
    mediaList,
    isSelectionMode,
    selectedIds,
    selectAll,
    deselectAll,
    setIsSelectionMode,
    rescanFolders,
    syncStatus,
    gridDensity,
    setGridDensity,
  } = useGallery();

  const isSyncing = syncStatus.state === 'checking' || syncStatus.state === 'indexing';

  // Toggle density cycles between compact (5) -> comfortable (4) -> expanded (3)
  const cycleGridDensity = () => {
    if (gridDensity === 'compact') setGridDensity('comfortable');
    else if (gridDensity === 'comfortable') setGridDensity('expanded');
    else setGridDensity('compact');
  };

  // Selection mode header
  if (isSelectionMode) {
    const isAllSelected = selectedIds.size > 0 && selectedIds.size === mediaList.length;

    return (
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#12141c]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-safe transition-colors duration-200">
        <div className="max-w-screen-md mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => deselectAll()}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Cancel selection"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-semibold text-base text-slate-900 dark:text-white">
              {selectedIds.size} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (isAllSelected ? deselectAll() : selectAll())}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Active Album Detail Header
  if (activeTab === 'albums' && activeAlbumId) {
    const currentAlbum = albums.find((a) => a.id === activeAlbumId);

    return (
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#12141c]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-safe transition-colors duration-200">
        <div className="max-w-screen-md mx-auto flex items-center justify-between h-14 px-3">
          <div className="flex items-center gap-1.5 truncate">
            <button
              onClick={() => setActiveAlbumId(null)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Back to albums"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
              {currentAlbum?.title || 'Album'}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {!currentAlbum?.isSystem && (
              <button
                onClick={onOpenAddPhotosToAlbum}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                title="Add photos to album"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsSelectionMode(true)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              title="Select items"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Standard tab titles
  let title = 'Gallery';
  if (activeTab === 'albums') title = 'Albums';
  if (activeTab === 'search') title = 'Search';
  if (activeTab === 'settings') title = 'Settings';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#12141c]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-safe transition-colors duration-200">
      <div className="max-w-screen-md mx-auto flex items-center justify-between h-14 px-4">
        <h1 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>

        <div className="flex items-center gap-1">
          {activeTab === 'photos' && (
            <>
              {/* Density toggle button */}
              <button
                onClick={cycleGridDensity}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title={`Grid density: ${gridDensity}`}
                aria-label="Change grid density"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {/* Rescan / Sync button */}
              <button
                onClick={() => rescanFolders()}
                disabled={isSyncing}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
                title="Rescan folders"
                aria-label="Rescan folders"
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
              </button>

              {/* Enter selection mode */}
              {mediaList.length > 0 && (
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Select media"
                  aria-label="Select media"
                >
                  <CheckSquare className="w-5 h-5" />
                </button>
              )}
            </>
          )}

          {activeTab === 'albums' && onOpenCreateAlbum && (
            <button
              onClick={onOpenCreateAlbum}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Album</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
