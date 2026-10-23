import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase } from '../services/storage/database';
import { saveDirectoryHandle, deleteDirectoryHandle } from '../services/storage/handleStorage';
import { requestDirectoryHandle, isDirectoryPickerSupported } from '../services/media/directoryAccess';
import { selectLocalFiles } from '../services/media/filePicker';
import { syncAllFolders, importFiles } from '../services/media/mediaScanner';
import { populateSampleMedia } from '../services/media/sampleMedia';
import type {
  MediaItem,
  FolderRecord,
  AlbumRecord,
  SyncStatus,
  GridDensity,
} from '../../src/types/media';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error';
}

interface GalleryContextType {
  // Navigation
  activeTab: 'photos' | 'albums' | 'search' | 'settings';
  setActiveTab: (tab: 'photos' | 'albums' | 'search' | 'settings') => void;
  activeAlbumId: string | null;
  setActiveAlbumId: (id: string | null) => void;

  // Media data
  mediaList: MediaItem[];
  trashedList: MediaItem[];
  albums: AlbumRecord[];
  folders: FolderRecord[];
  isLoading: boolean;

  // Selection
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  selectAll: (idsToSelect?: string[]) => void;
  deselectAll: () => void;
  setIsSelectionMode: (val: boolean) => void;

  // Viewer
  activeViewerIndex: number | null;
  viewerList: MediaItem[];
  openViewer: (itemOrIndex: MediaItem | number, customList?: MediaItem[]) => void;
  closeViewer: () => void;

  // Editor
  editingItem: MediaItem | null;
  openEditor: (item: MediaItem) => void;
  closeEditor: () => void;

  // Details Sheet
  detailsItem: MediaItem | null;
  openDetails: (item: MediaItem) => void;
  closeDetails: () => void;

  // Sync & Folders
  syncStatus: SyncStatus;
  connectNewFolder: () => Promise<void>;
  rescanFolders: () => Promise<void>;
  importManualFiles: () => Promise<void>;
  removeFolder: (folderId: string) => Promise<void>;
  loadSamplePhotos: () => Promise<void>;

  // Media Operations
  toggleFavorite: (id: string) => Promise<void>;
  moveToTrash: (ids: string[]) => Promise<void>;
  restoreFromTrash: (ids: string[]) => Promise<void>;
  deletePermanently: (ids: string[]) => Promise<void>;
  emptyTrash: () => Promise<void>;

  // Albums
  createAlbum: (title: string, initialMediaIds?: string[]) => Promise<string>;
  renameAlbum: (id: string, newTitle: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  addMediaToAlbum: (albumId: string, mediaIds: string[]) => Promise<void>;
  removeMediaFromAlbum: (albumId: string, mediaIds: string[]) => Promise<void>;

  // Settings
  gridDensity: GridDensity;
  setGridDensity: (density: GridDensity) => void;

  // Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'albums' | 'search' | 'settings'>('photos');
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);

  // Selection
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Viewer
  const [activeViewerIndex, setActiveViewerIndex] = useState<number | null>(null);
  const [viewerList, setViewerList] = useState<MediaItem[]>([]);

  // Editor
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Details
  const [detailsItem, setDetailsItem] = useState<MediaItem | null>(null);

  // Sync
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'idle',
    message: '',
  });

  // Settings
  const [gridDensity, setGridDensityState] = useState<GridDensity>('comfortable');

  // Toast
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3200);
  }, []);

  // Initialize DB on mount
  useEffect(() => {
    initializeDatabase().then(async () => {
      const savedDensity = await db.settings.get('gridDensity');
      if (savedDensity && savedDensity.value) {
        setGridDensityState(savedDensity.value);
      }

      // Check folders and sync on app launch
      rescanFolders();
    });
  }, []);

  // Sync on return to foreground (visibilitychange)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        rescanFolders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Query media items (active, non-trashed, newest first)
  const mediaList = useLiveQuery(
    () => db.media.filter((m) => !m.isTrash).reverse().sortBy('captureDate'),
    [],
    []
  );

  // Query trashed items
  const trashedList = useLiveQuery(
    () => db.media.filter((m) => !!m.isTrash).reverse().sortBy('trashedAt'),
    [],
    []
  );

  // Query albums
  const albums = useLiveQuery(() => db.albums.toArray(), [], []);

  // Query folders
  const folders = useLiveQuery(() => db.folders.toArray(), [], []);

  const isLoading = mediaList === undefined;

  // Grid density setting change
  const setGridDensity = (density: GridDensity) => {
    setGridDensityState(density);
    db.settings.put({ key: 'gridDensity', value: density });
  };

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) {
        setIsSelectionMode(false);
      } else {
        setIsSelectionMode(true);
      }
      return next;
    });
  };

  const selectAll = (idsToSelect?: string[]) => {
    const ids = idsToSelect || mediaList.map((m) => m.id);
    setSelectedIds(new Set(ids));
    setIsSelectionMode(true);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  // Viewer helpers
  const openViewer = (itemOrIndex: MediaItem | number, customList?: MediaItem[]) => {
    const list = customList || mediaList;
    setViewerList(list);

    let index = 0;
    if (typeof itemOrIndex === 'number') {
      index = itemOrIndex;
    } else {
      index = list.findIndex((m) => m.id === itemOrIndex.id);
      if (index === -1) index = 0;
    }

    setActiveViewerIndex(index);
  };

  const closeViewer = () => {
    setActiveViewerIndex(null);
  };

  // Editor helpers
  const openEditor = (item: MediaItem) => {
    setEditingItem(item);
  };

  const closeEditor = () => {
    setEditingItem(null);
  };

  // Details helpers
  const openDetails = (item: MediaItem) => {
    setDetailsItem(item);
  };

  const closeDetails = () => {
    setDetailsItem(null);
  };

  // Connect new folder via Directory Picker (with graceful fallback to file picker)
  const connectNewFolder = async () => {
    if (!isDirectoryPickerSupported()) {
      showToast('Selecting photos directly from your device...', 'info');
      await importManualFiles();
      return;
    }

    try {
      const handle = await requestDirectoryHandle();
      if (!handle) return; // User cancelled

      const folderId = `folder_${Date.now()}`;
      await saveDirectoryHandle(folderId, handle);

      await db.folders.put({
        id: folderId,
        name: handle.name,
        permission: 'granted',
        itemCount: 0,
        createdAt: Date.now(),
      });

      showToast(`Added folder: ${handle.name}`, 'success');
      await rescanFolders();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Could not access folder', 'error');
    }
  };

  // Rescan all connected folders
  const rescanFolders = async () => {
    try {
      await syncAllFolders((status) => {
        setSyncStatus(status);
      });
    } catch (e) {
      setSyncStatus({ state: 'error', message: 'Sync failed' });
    }
  };

  // Fallback / manual import
  const importManualFiles = async () => {
    try {
      setSyncStatus({ state: 'checking', message: 'Selecting files...' });
      const files = await selectLocalFiles();
      if (files.length === 0) {
        setSyncStatus({ state: 'idle', message: '' });
        return;
      }

      setSyncStatus({
        state: 'indexing',
        message: `Importing ${files.length} items...`,
        itemsIndexed: 0,
      });

      const count = await importFiles(files, (status) => {
        setSyncStatus(status);
      });

      showToast(`Imported ${count} ${count === 1 ? 'item' : 'items'} into Gallery`, 'success');
      setTimeout(() => {
        setSyncStatus({ state: 'idle', message: '' });
      }, 3000);
    } catch (err: any) {
      setSyncStatus({ state: 'error', message: err.message || 'Import failed' });
      showToast(err.message || 'File import failed', 'error');
    }
  };

  // Remove a folder handle
  const removeFolder = async (folderId: string) => {
    await deleteDirectoryHandle(folderId);
    await db.folders.delete(folderId);
    showToast('Folder disconnected from Gallery', 'info');
  };

  // Populate synthetic sample photos for instant preview
  const loadSamplePhotos = async () => {
    try {
      const count = await populateSampleMedia();
      showToast(`Loaded ${count} sample photos into Gallery`, 'success');
    } catch (e: any) {
      console.warn('Failed to load sample media:', e);
      showToast('Could not load sample photos', 'error');
    }
  };

  // Media operations
  const toggleFavorite = async (id: string) => {
    const item = await db.media.get(id);
    if (!item) return;

    const nextFav = !item.isFavorite;
    await db.media.update(id, { isFavorite: nextFav });

    // Update Favorites system album
    if (nextFav) {
      await db.albumMedia.put({
        id: `sys_favorites_${id}`,
        albumId: 'sys_favorites',
        mediaId: id,
        addedAt: Date.now(),
      });
    } else {
      await db.albumMedia.where({ albumId: 'sys_favorites', mediaId: id }).delete();
    }

    const count = await db.albumMedia.where('albumId').equals('sys_favorites').count();
    await db.albums.update('sys_favorites', { itemCount: count, updatedAt: Date.now() });

    showToast(nextFav ? 'Added to Favorites' : 'Removed from Favorites', 'info');
  };

  const moveToTrash = async (ids: string[]) => {
    const now = Date.now();
    await db.transaction('rw', db.media, async () => {
      for (const id of ids) {
        await db.media.update(id, {
          isTrash: true,
          trashedAt: now,
        });
      }
    });

    deselectAll();
    closeViewer();
    showToast(`Moved ${ids.length} ${ids.length === 1 ? 'item' : 'items'} to Recently Deleted`, 'info');
  };

  const restoreFromTrash = async (ids: string[]) => {
    await db.transaction('rw', db.media, async () => {
      for (const id of ids) {
        await db.media.update(id, {
          isTrash: false,
          trashedAt: undefined,
        });
      }
    });

    showToast(`Restored ${ids.length} ${ids.length === 1 ? 'item' : 'items'} to Gallery`, 'success');
  };

  const deletePermanently = async (ids: string[]) => {
    await db.transaction('rw', db.media, db.albumMedia, async () => {
      for (const id of ids) {
        await db.media.delete(id);
        await db.albumMedia.where('mediaId').equals(id).delete();
      }
    });

    showToast(`Permanently deleted ${ids.length} items from app`, 'info');
  };

  const emptyTrash = async () => {
    const trashed = await db.media.filter((m) => !!m.isTrash).toArray();
    const ids = trashed.map((t) => t.id);
    await deletePermanently(ids);
    showToast('Trash emptied', 'info');
  };

  // Albums
  const createAlbum = async (title: string, initialMediaIds: string[] = []): Promise<string> => {
    const albumId = `album_${Date.now()}`;
    const now = Date.now();

    await db.albums.put({
      id: albumId,
      title: title.trim(),
      isSystem: false,
      itemCount: initialMediaIds.length,
      coverMediaId: initialMediaIds[0],
      createdAt: now,
      updatedAt: now,
    });

    if (initialMediaIds.length > 0) {
      for (const mediaId of initialMediaIds) {
        await db.albumMedia.put({
          id: `${albumId}_${mediaId}`,
          albumId,
          mediaId,
          addedAt: now,
        });
      }
    }

    showToast(`Created album "${title}"`, 'success');
    return albumId;
  };

  const renameAlbum = async (id: string, newTitle: string) => {
    await db.albums.update(id, { title: newTitle.trim(), updatedAt: Date.now() });
    showToast('Album renamed', 'info');
  };

  const deleteAlbum = async (id: string) => {
    await db.transaction('rw', db.albums, db.albumMedia, async () => {
      await db.albums.delete(id);
      await db.albumMedia.where('albumId').equals(id).delete();
    });
    if (activeAlbumId === id) {
      setActiveAlbumId(null);
    }
    showToast('Album deleted (photos kept in gallery)', 'info');
  };

  const addMediaToAlbum = async (albumId: string, mediaIds: string[]) => {
    const now = Date.now();
    for (const mediaId of mediaIds) {
      const existing = await db.albumMedia.where('[albumId+mediaId]').equals([albumId, mediaId]).first();
      if (!existing) {
        await db.albumMedia.put({
          id: `${albumId}_${mediaId}`,
          albumId,
          mediaId,
          addedAt: now,
        });
      }
    }

    const count = await db.albumMedia.where('albumId').equals(albumId).count();
    await db.albums.update(albumId, {
      itemCount: count,
      updatedAt: now,
      coverMediaId: mediaIds[0],
    });

    deselectAll();
    showToast(`Added ${mediaIds.length} items to album`, 'success');
  };

  const removeMediaFromAlbum = async (albumId: string, mediaIds: string[]) => {
    for (const mediaId of mediaIds) {
      await db.albumMedia.where('[albumId+mediaId]').equals([albumId, mediaId]).delete();
    }
    const count = await db.albumMedia.where('albumId').equals(albumId).count();
    await db.albums.update(albumId, { itemCount: count, updatedAt: Date.now() });
    showToast(`Removed items from album`, 'info');
  };

  return (
    <GalleryContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeAlbumId,
        setActiveAlbumId,
        mediaList,
        trashedList,
        albums,
        folders,
        isLoading,
        isSelectionMode,
        selectedIds,
        toggleSelect,
        selectAll,
        deselectAll,
        setIsSelectionMode,
        activeViewerIndex,
        viewerList,
        openViewer,
        closeViewer,
        editingItem,
        openEditor,
        closeEditor,
        detailsItem,
        openDetails,
        closeDetails,
        syncStatus,
        connectNewFolder,
        rescanFolders,
        importManualFiles,
        removeFolder,
        loadSamplePhotos,
        toggleFavorite,
        moveToTrash,
        restoreFromTrash,
        deletePermanently,
        emptyTrash,
        createAlbum,
        renameAlbum,
        deleteAlbum,
        addMediaToAlbum,
        removeMediaFromAlbum,
        gridDensity,
        setGridDensity,
        toast,
        showToast,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export function useGallery(): GalleryContextType {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}
