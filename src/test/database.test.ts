import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase, SYSTEM_ALBUMS } from '../services/storage/database';

describe('IndexedDB Gallery Database Service', () => {
  beforeEach(async () => {
    await db.media.clear();
    await db.folders.clear();
    await db.albums.clear();
    await db.albumMedia.clear();
    await db.settings.clear();
  });

  it('initializes default settings and system albums', async () => {
    await initializeDatabase();

    const themeSetting = await db.settings.get('theme');
    expect(themeSetting?.value).toBe('light');

    const densitySetting = await db.settings.get('gridDensity');
    expect(densitySetting?.value).toBe('comfortable');

    const allAlbums = await db.albums.toArray();
    expect(allAlbums.length).toBe(SYSTEM_ALBUMS.length);

    const videoAlbum = await db.albums.get('sys_videos');
    expect(videoAlbum?.title).toBe('Videos');
    expect(videoAlbum?.isSystem).toBe(true);

    const favAlbum = await db.albums.get('sys_favorites');
    expect(favAlbum?.title).toBe('Favorites');
    expect(favAlbum?.isSystem).toBe(true);
  });

  it('stores and indexes media items by captureDate and flags', async () => {
    await db.media.put({
      id: 'test_1',
      name: 'photo1.jpg',
      type: 'image',
      mimeType: 'image/jpeg',
      size: 1024,
      createdAt: 1000,
      modifiedAt: 1000,
      captureDate: 1000,
      storageMode: 'imported',
      isFavorite: true,
      isTrash: false,
    });

    await db.media.put({
      id: 'test_2',
      name: 'photo2.jpg',
      type: 'image',
      mimeType: 'image/jpeg',
      size: 2048,
      createdAt: 2000,
      modifiedAt: 2000,
      captureDate: 2000,
      storageMode: 'imported',
      isFavorite: false,
      isTrash: true,
      trashedAt: 2500,
    });

    const activeMedia = await db.media.filter((m) => !m.isTrash).toArray();
    expect(activeMedia.length).toBe(1);
    expect(activeMedia[0].id).toBe('test_1');

    const favorites = await db.media.filter((m) => !!m.isFavorite).toArray();
    expect(favorites.length).toBe(1);
    expect(favorites[0].id).toBe('test_1');

    const trashed = await db.media.filter((m) => !!m.isTrash).toArray();
    expect(trashed.length).toBe(1);
    expect(trashed[0].id).toBe('test_2');
  });
});
