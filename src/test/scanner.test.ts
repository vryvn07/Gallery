import { describe, it, expect, beforeEach } from 'vitest';
import { detectMediaType, getFileExtension, indexMediaFile } from '../services/media/mediaScanner';
import { db, initializeDatabase } from '../services/storage/database';

describe('Media Scanner & Deduplication Service', () => {
  beforeEach(async () => {
    await db.media.clear();
    await db.albums.clear();
    await db.albumMedia.clear();
    await initializeDatabase();
  });

  it('detects image and video extensions correctly', () => {
    expect(getFileExtension('photo.JPG')).toBe('jpg');
    expect(getFileExtension('movie.mp4')).toBe('mp4');
    expect(getFileExtension('sample')).toBe('');

    expect(detectMediaType('photo.jpg', 'image/jpeg')).toBe('image');
    expect(detectMediaType('graphic.png', 'image/png')).toBe('image');
    expect(detectMediaType('video.mp4', 'video/mp4')).toBe('video');
    expect(detectMediaType('clip.webm', 'video/webm')).toBe('video');
    expect(detectMediaType('document.pdf', 'application/pdf')).toBe(null);
  });

  it('indexes media files and associates them with system albums', async () => {
    const fakeFile = new File(['dummy photo data'], 'holiday_screenshot.png', {
      type: 'image/png',
      lastModified: 1700000000000,
    });

    const item = await indexMediaFile(fakeFile, {
      storageMode: 'imported',
      folderName: 'Screenshots',
    });

    expect(item).not.toBeNull();
    expect(item?.type).toBe('image');
    expect(item?.name).toBe('holiday_screenshot.png');

    // Verify it was added to sys_all and sys_screenshots
    const screenshotLinks = await db.albumMedia.where('albumId').equals('sys_screenshots').toArray();
    expect(screenshotLinks.length).toBe(1);
    expect(screenshotLinks[0].mediaId).toBe(item?.id);
  });

  it('prevents duplicate records when re-indexing identical files', async () => {
    const fakeFile = new File(['dummy content'], 'nature.jpg', {
      type: 'image/jpeg',
      lastModified: 1700000000000,
    });

    const first = await indexMediaFile(fakeFile, { storageMode: 'imported' });
    const second = await indexMediaFile(fakeFile, { storageMode: 'imported' });

    expect(first?.id).toBe(second?.id);

    const count = await db.media.count();
    expect(count).toBe(1);
  });
});
