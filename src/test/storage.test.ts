import { describe, it, expect, beforeEach } from 'vitest';
import { formatBytes, clearThumbnailCache, getStorageEstimate } from '../services/storage/storageQuota';
import { db } from '../services/storage/database';

describe('Storage Quota and Cache Management', () => {
  beforeEach(async () => {
    await db.media.clear();
  });

  it('formats byte quantities into readable strings', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 5.5)).toBe('5.5 MB');
    expect(formatBytes(1024 * 1024 * 1024 * 12.2)).toBe('12.2 GB');
  });

  it('clears thumbnail cache from items without deleting media', async () => {
    await db.media.put({
      id: 'media_thumb_test',
      name: 'photo.jpg',
      type: 'image',
      mimeType: 'image/jpeg',
      size: 5000,
      createdAt: 1000,
      modifiedAt: 1000,
      captureDate: 1000,
      storageMode: 'imported',
      isFavorite: false,
      isTrash: false,
      thumbnailBlob: new Blob(['thumbnail data'], { type: 'image/webp' }),
    });

    const itemBefore = await db.media.get('media_thumb_test');
    expect(itemBefore?.thumbnailBlob).toBeDefined();

    const clearedCount = await clearThumbnailCache();
    expect(clearedCount).toBe(1);

    const itemAfter = await db.media.get('media_thumb_test');
    expect(itemAfter).toBeDefined(); // Media item remains safe!
    expect(itemAfter?.thumbnailBlob).toBeUndefined(); // Thumbnail cleared
  });

  it('retrieves storage estimate from navigator.storage', async () => {
    const est = await getStorageEstimate();
    expect(est.usage).toBeGreaterThan(0);
    expect(est.quota).toBeGreaterThan(0);
  });
});
