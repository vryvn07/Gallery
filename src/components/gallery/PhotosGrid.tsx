import React, { useMemo } from 'react';
import { FolderPlus, Upload, ShieldCheck, Check, Sparkles } from 'lucide-react';
import type { MediaItem } from '../../types/media';
import { MediaThumbnail } from './MediaThumbnail';
import { useGallery } from '../../context/GalleryContext';

interface PhotosGridProps {
  media: MediaItem[];
  emptyMessage?: string;
  emptySubtext?: string;
}

interface DateGroup {
  key: string;
  label: string;
  items: MediaItem[];
}

function formatDateGroup(timestamp: number): { key: string; label: string } {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return { key: 'today', label: 'Today' };
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return { key: 'yesterday', label: 'Yesterday' };
  }

  const isCurrentYear = date.getFullYear() === now.getFullYear();
  if (isCurrentYear) {
    const month = date.toLocaleDateString(undefined, { month: 'long' });
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: month,
    };
  }

  const monthYear = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return {
    key: `${date.getFullYear()}-${date.getMonth()}`,
    label: monthYear,
  };
}

export const PhotosGrid: React.FC<PhotosGridProps> = ({
  media,
  emptyMessage = 'No photos or videos yet',
  emptySubtext = 'Connect a device folder or import files to start browsing your personal gallery.',
}) => {
  const {
    gridDensity,
    connectNewFolder,
    importManualFiles,
    loadSamplePhotos,
    isSelectionMode,
    selectedIds,
    selectAll,
  } = useGallery();

  // Group media items chronologically by date
  const groups = useMemo(() => {
    const groupMap = new Map<string, { label: string; items: MediaItem[] }>();

    for (const item of media) {
      const { key, label } = formatDateGroup(item.captureDate);
      if (!groupMap.has(key)) {
        groupMap.set(key, { label, items: [] });
      }
      groupMap.get(key)!.items.push(item);
    }

    const result: DateGroup[] = [];
    groupMap.forEach((val, key) => {
      result.push({ key, label: val.label, items: val.items });
    });

    return result;
  }, [media]);

  // Determine grid columns from gridDensity setting
  const gridColClass = useMemo(() => {
    switch (gridDensity) {
      case 'compact':
        return 'grid-cols-5 md:grid-cols-6 lg:grid-cols-7';
      case 'expanded':
        return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 'comfortable':
      default:
        return 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6';
    }
  }, [gridDensity]);

  // Empty state
  if (media.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[65vh]">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {emptyMessage}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          {emptySubtext}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mb-8">
          <button
            onClick={() => connectNewFolder()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Connect Folder</span>
          </button>

          <button
            onClick={() => importManualFiles()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Files</span>
          </button>
        </div>

        <button
          onClick={() => loadSamplePhotos()}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Or load demo photos to explore</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Private • Stored strictly on device • No cloud uploads</span>
        </div>
      </div>
    );
  }

  // Toggle selection for all items in a date group
  const handleGroupToggle = (groupItems: MediaItem[]) => {
    const groupIds = groupItems.map((i) => i.id);
    const allInGroupSelected = groupIds.every((id) => selectedIds.has(id));

    if (allInGroupSelected) {
      // Deselect group items
      const next = new Set(selectedIds);
      groupIds.forEach((id) => next.delete(id));
      selectAll(Array.from(next));
    } else {
      // Select all group items
      const next = new Set(selectedIds);
      groupIds.forEach((id) => next.add(id));
      selectAll(Array.from(next));
    }
  };

  return (
    <div className="flex-1 pb-24">
      {groups.map((group) => {
        const groupIds = group.items.map((i) => i.id);
        const allInGroupSelected = groupIds.every((id) => selectedIds.has(id));

        return (
          <section key={group.key} className="mb-4">
            {/* Date Group Header */}
            <div className="sticky top-14 z-10 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-md px-4 py-2 flex items-center justify-between transition-colors">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                {group.label}
              </h3>

              {isSelectionMode && (
                <button
                  onClick={() => handleGroupToggle(group.items)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                    allInGroupSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 text-transparent'
                  }`}
                  aria-label={`Select all items from ${group.label}`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Edge-to-edge media grid */}
            <div className={`grid ${gridColClass} gap-0.5 px-0.5`}>
              {group.items.map((item) => {
                const globalIndex = media.findIndex((m) => m.id === item.id);
                return (
                  <MediaThumbnail
                    key={item.id}
                    item={item}
                    index={globalIndex}
                    allMedia={media}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
