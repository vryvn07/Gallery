import { db } from './database';
import type { StorageEstimateInfo } from '../../types/media';

/**
 * Returns storage usage and quota estimate
 */
export async function getStorageEstimate(): Promise<StorageEstimateInfo> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;

      return {
        usage,
        quota,
        percentUsed,
        persisted,
      };
    } catch (e) {
      console.warn('Error reading storage estimate:', e);
    }
  }

  return {
    usage: 0,
    quota: 0,
    percentUsed: 0,
    persisted: false,
  };
}

/**
 * Requests persistent storage from browser to prevent eviction
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch (e) {
      console.warn('Error requesting storage persistence:', e);
    }
  }
  return false;
}

/**
 * Clears cached thumbnails to reclaim browser storage without losing media items
 */
export async function clearThumbnailCache(): Promise<number> {
  let clearedCount = 0;
  await db.transaction('rw', db.media, async () => {
    const items = await db.media.toArray();
    for (const item of items) {
      if (item.thumbnailBlob) {
        await db.media.update(item.id, { thumbnailBlob: undefined });
        clearedCount++;
      }
    }
  });
  return clearedCount;
}

/**
 * Formats bytes to human-readable string (MB, GB, etc.)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
