import Dexie, { type Table } from 'dexie';
import type { MediaItem, FolderRecord, AlbumRecord, AlbumMediaRecord, UserSettings } from '../../types/media';

export class GalleryDatabase extends Dexie {
  media!: Table<MediaItem, string>;
  folders!: Table<FolderRecord, string>;
  albums!: Table<AlbumRecord, string>;
  albumMedia!: Table<AlbumMediaRecord, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('GalleryDB');

    this.version(1).stores({
      media: 'id, captureDate, type, isFavorite, isTrash, trashedAt, storageMode, folderId, name, modifiedAt',
      folders: 'id, name, permission',
      albums: 'id, title, isSystem, systemType, updatedAt',
      albumMedia: 'id, albumId, mediaId, [albumId+mediaId]',
      settings: 'key',
    });
  }
}

export const db = new GalleryDatabase();

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light', // Master instruction: Light Mode is the default for new users
  gridDensity: 'comfortable',
  defaultSort: 'newest',
  autoSyncOnForeground: true,
  searchHistory: [],
};

// System Album Definitions
export const SYSTEM_ALBUMS = [
  { id: 'sys_all', title: 'All Media', systemType: 'all' as const },
  { id: 'sys_videos', title: 'Videos', systemType: 'videos' as const },
  { id: 'sys_screenshots', title: 'Screenshots', systemType: 'screenshots' as const },
  { id: 'sys_camera', title: 'Camera', systemType: 'camera' as const },
  { id: 'sys_downloads', title: 'Downloads', systemType: 'downloads' as const },
  { id: 'sys_favorites', title: 'Favorites', systemType: 'favorites' as const },
  { id: 'sys_recent', title: 'Recently Added', systemType: 'recent' as const },
];

/**
 * Initializes default settings and system albums on first boot
 */
export async function initializeDatabase(): Promise<void> {
  // Ensure default settings exist
  const existingTheme = await db.settings.get('theme');
  if (!existingTheme) {
    await db.settings.put({ key: 'theme', value: 'light' });
  }

  const existingDensity = await db.settings.get('gridDensity');
  if (!existingDensity) {
    await db.settings.put({ key: 'gridDensity', value: 'comfortable' });
  }

  const existingSort = await db.settings.get('defaultSort');
  if (!existingSort) {
    await db.settings.put({ key: 'defaultSort', value: 'newest' });
  }

  const existingHistory = await db.settings.get('searchHistory');
  if (!existingHistory) {
    await db.settings.put({ key: 'searchHistory', value: [] });
  }

  // Ensure system albums are present
  const albumCount = await db.albums.where('isSystem').equals(1).count();
  if (albumCount === 0) {
    const now = Date.now();
    for (const sys of SYSTEM_ALBUMS) {
      await db.albums.put({
        id: sys.id,
        title: sys.title,
        isSystem: true,
        systemType: sys.systemType,
        itemCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}
