import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, History, Sparkles, Filter } from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';
import { db } from '../../services/storage/database';
import { PhotosGrid } from '../gallery/PhotosGrid';
import type { MediaItem } from '../../types/media';

type FilterType = 'all' | 'image' | 'video' | 'favorite' | 'camera' | 'screenshot';

export const SearchView: React.FC = () => {
  const { mediaList } = useGallery();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [history, setHistory] = useState<string[]>([]);

  // Load search history from DB
  useEffect(() => {
    db.settings.get('searchHistory').then((rec) => {
      if (rec && Array.isArray(rec.value)) {
        setHistory(rec.value);
      }
    });
  }, []);

  const saveQueryToHistory = (newQuery: string) => {
    const trimmed = newQuery.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...history.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10);
    setHistory(updated);
    db.settings.put({ key: 'searchHistory', value: updated });
  };

  const clearHistory = () => {
    setHistory([]);
    db.settings.put({ key: 'searchHistory', value: [] });
  };

  // Filter and search
  const filteredMedia = useMemo(() => {
    const q = query.trim().toLowerCase();

    return mediaList.filter((item) => {
      // 1. Media Type Filter
      if (activeFilter === 'image' && item.type !== 'image') return false;
      if (activeFilter === 'video' && item.type !== 'video') return false;
      if (activeFilter === 'favorite' && !item.isFavorite) return false;
      if (
        activeFilter === 'screenshot' &&
        !item.name.toLowerCase().includes('screenshot') &&
        !(item.relativePath || '').toLowerCase().includes('screenshot')
      ) {
        return false;
      }
      if (
        activeFilter === 'camera' &&
        !(item.folderName || '').toLowerCase().includes('camera') &&
        !(item.relativePath || '').toLowerCase().includes('dcim')
      ) {
        return false;
      }

      // 2. Query search
      if (!q) return true;

      // Check filename
      if (item.name.toLowerCase().includes(q)) return true;

      // Check folder or relative path
      if (item.folderName && item.folderName.toLowerCase().includes(q)) return true;
      if (item.relativePath && item.relativePath.toLowerCase().includes(q)) return true;

      // Check camera model in EXIF
      if (item.exif?.model && item.exif.model.toLowerCase().includes(q)) return true;
      if (item.exif?.make && item.exif.make.toLowerCase().includes(q)) return true;

      // Check date (e.g. "2026", "october", "monday")
      const dateStr = new Date(item.captureDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).toLowerCase();
      if (dateStr.includes(q)) return true;

      return false;
    });
  }, [mediaList, query, activeFilter]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      saveQueryToHistory(query);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-screen-md mx-auto px-4 py-3 pb-24">
      {/* Search Input Bar */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, date, camera, or folder..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-4 scrollbar-none">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'image', label: 'Photos' },
            { id: 'video', label: 'Videos' },
            { id: 'favorite', label: 'Favorites' },
            { id: 'screenshot', label: 'Screenshots' },
            { id: 'camera', label: 'Camera' },
          ] as { id: FilterType; label: string }[]
        ).map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search History Tags when query is empty */}
      {!query && history.length > 0 && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <History className="w-3.5 h-3.5" />
              <span>Recent Searches</span>
            </div>
            <button
              onClick={clearHistory}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => setQuery(h)}
                className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count Header */}
      {query && (
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 px-1">
          Found {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
        </div>
      )}

      {/* Results Grid */}
      <PhotosGrid
        media={filteredMedia}
        emptyMessage={query ? 'No matching media found' : 'Explore your gallery'}
        emptySubtext={
          query
            ? 'Try searching by a different term or date.'
            : 'Type a name, year, month, or camera model above.'
        }
      />
    </div>
  );
};
