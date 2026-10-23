import { db } from '../storage/database';
import { generateImageThumbnail, generateVideoThumbnail } from './thumbnailService';
import { extractExifMetadata } from './metadataService';
import { scanDirectoryEntries, verifyDirectoryPermission } from './directoryAccess';
import { getDirectoryHandle } from '../storage/handleStorage';
import type { MediaItem, SyncStatus, StorageMode } from '../../types/media';

const SUPPORTED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'heic', 'heif', 'svg']);
const SUPPORTED_VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'mkv', '3gp', 'ogg']);

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function detectMediaType(filename: string, mimeType: string): 'image' | 'video' | null {
  const ext = getFileExtension(filename);
  if (mimeType.startsWith('video/') || SUPPORTED_VIDEO_EXTS.has(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('image/') || SUPPORTED_IMAGE_EXTS.has(ext)) {
    return 'image';
  }
  return null;
}

/**
 * Updates item counts for all system and custom albums in one optimized pass
 */
export async function updateSystemAlbumCounts(): Promise<void> {
  try {
    const albums = await db.albums.toArray();
    for (const album of albums) {
      const count = await db.albumMedia.where('albumId').equals(album.id).count();
      await db.albums.update(album.id, { itemCount: count, updatedAt: Date.now() });
    }
  } catch (err) {
    console.warn('Failed to update album counts:', err);
  }
}

/**
 * Categorizes media item into relevant system albums
 */
async function autoCategorizeMedia(item: MediaItem, skipCountUpdate = false): Promise<void> {
  const albumsToJoin: string[] = ['sys_all', 'sys_recent'];

  if (item.type === 'video') {
    albumsToJoin.push('sys_videos');
  }

  const lowerName = item.name.toLowerCase();
  const lowerPath = (item.relativePath || '').toLowerCase();
  const lowerFolder = (item.folderName || '').toLowerCase();

  if (lowerName.includes('screenshot') || lowerPath.includes('screenshot') || lowerFolder.includes('screenshot')) {
    albumsToJoin.push('sys_screenshots');
  }

  if (lowerFolder.includes('camera') || lowerFolder.includes('dcim') || lowerPath.includes('camera') || lowerPath.includes('dcim')) {
    albumsToJoin.push('sys_camera');
  }

  if (lowerFolder.includes('download') || lowerPath.includes('download')) {
    albumsToJoin.push('sys_downloads');
  }

  if (item.isFavorite) {
    albumsToJoin.push('sys_favorites');
  }

  // Fast direct upserts without redundant pre-queries
  for (const albumId of albumsToJoin) {
    await db.albumMedia.put({
      id: `${albumId}_${item.id}`,
      albumId,
      mediaId: item.id,
      addedAt: Date.now(),
    });
  }

  if (!skipCountUpdate) {
    for (const albumId of albumsToJoin) {
      const count = await db.albumMedia.where('albumId').equals(albumId).count();
      await db.albums.update(albumId, { itemCount: count, updatedAt: Date.now() });
    }
  }
}

/**
 * Indexes a single file (either imported or referenced)
 */
export async function indexMediaFile(
  file: File,
  options: {
    storageMode: StorageMode;
    folderId?: string;
    folderName?: string;
    relativePath?: string;
    skipCountUpdate?: boolean;
  }
): Promise<MediaItem | null> {
  const type = detectMediaType(file.name, file.type);
  if (!type) return null;

  // Generate deterministic ID
  const id = options.storageMode === 'referenced' && options.folderId
    ? `ref_${options.folderId}_${options.relativePath || file.name}`
    : `imp_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}_${file.size}_${file.lastModified}`;

  // Check if existing record is identical
  const existing = await db.media.get(id);
  if (existing && existing.size === file.size && existing.modifiedAt === file.lastModified) {
    return existing; // Already indexed and unchanged
  }

  // Extract EXIF metadata
  const exif = type === 'image' ? await extractExifMetadata(file) : undefined;

  let captureDate = file.lastModified;
  if (exif?.dateTimeOriginal) {
    const parsed = new Date(exif.dateTimeOriginal).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      captureDate = parsed;
    }
  }

  // Generate thumbnail
  let thumbResult;
  try {
    if (type === 'image') {
      thumbResult = await generateImageThumbnail(file);
    } else {
      thumbResult = await generateVideoThumbnail(file);
    }
  } catch (err) {
    console.warn(`Could not generate thumbnail for ${file.name}:`, err);
  }

  const mediaItem: MediaItem = {
    id,
    name: file.name,
    type,
    mimeType: file.type || (type === 'image' ? 'image/jpeg' : 'video/mp4'),
    size: file.size,
    createdAt: file.lastModified,
    modifiedAt: file.lastModified,
    captureDate,
    storageMode: options.storageMode,
    folderId: options.folderId,
    folderName: options.folderName,
    relativePath: options.relativePath,
    blob: options.storageMode === 'imported' ? file : undefined, // Referenced mode keeps originals on disk!
    thumbnailBlob: thumbResult?.thumbnailBlob,
    width: thumbResult?.width,
    height: thumbResult?.height,
    duration: thumbResult?.duration,
    isFavorite: existing?.isFavorite || false,
    isTrash: existing?.isTrash || false,
    trashedAt: existing?.trashedAt,
    exif,
  };

  await db.media.put(mediaItem);

  // Link to system albums
  await autoCategorizeMedia(mediaItem, options.skipCountUpdate);

  return mediaItem;
}

/**
 * Scans a connected folder using its saved DirectoryHandle with concurrent processing
 */
export async function scanFolder(
  folderId: string,
  onStatus?: (status: SyncStatus) => void
): Promise<number> {
  const folderRecord = await db.folders.get(folderId);
  if (!folderRecord) {
    onStatus?.({ state: 'error', message: 'Folder not found' });
    return 0;
  }

  const handle = await getDirectoryHandle(folderId);
  if (!handle) {
    onStatus?.({ state: 'error', message: 'Folder handle is no longer accessible' });
    return 0;
  }

  onStatus?.({ state: 'checking', message: `Checking ${folderRecord.name}...` });

  const hasPermission = await verifyDirectoryPermission(handle);
  if (!hasPermission) {
    await db.folders.update(folderId, { permission: 'denied' });
    onStatus?.({ state: 'permission_required', message: `Permission needed for ${folderRecord.name}` });
    return 0;
  }

  await db.folders.update(folderId, { permission: 'granted' });

  onStatus?.({ state: 'indexing', message: `Scanning ${folderRecord.name}...` });

  const entries = await scanDirectoryEntries(handle, 2);
  let indexedCount = 0;
  let processed = 0;

  // Concurrent worker pool (4 items simultaneously)
  const CONCURRENCY = 4;
  let cursor = 0;

  const worker = async () => {
    while (cursor < entries.length) {
      const idx = cursor++;
      const entry = entries[idx];
      try {
        const item = await indexMediaFile(entry.file, {
          storageMode: 'referenced',
          folderId,
          folderName: folderRecord.name,
          relativePath: entry.relativePath,
          skipCountUpdate: true,
        });
        if (item) indexedCount++;
      } catch (err) {
        console.warn(`Error indexing ${entry.name}:`, err);
      }

      processed++;
      if (processed % 4 === 0 || processed === entries.length) {
        onStatus?.({
          state: 'indexing',
          message: `Indexed ${indexedCount} of ${entries.length} items...`,
          itemsIndexed: indexedCount,
        });
      }
    }
  };

  const pool = Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker);
  await Promise.all(pool);

  // Update album statistics once after batch finishes
  await updateSystemAlbumCounts();

  await db.folders.update(folderId, {
    itemCount: indexedCount,
    lastSyncedAt: Date.now(),
  });

  onStatus?.({
    state: 'success',
    message: `Sync complete: ${indexedCount} items in ${folderRecord.name}`,
    itemsIndexed: indexedCount,
  });

  return indexedCount;
}

/**
 * Rescans all configured folders in the database
 */
export async function syncAllFolders(onStatus?: (status: SyncStatus) => void): Promise<number> {
  const folders = await db.folders.toArray();
  if (folders.length === 0) {
    onStatus?.({ state: 'idle', message: 'No folders configured' });
    return 0;
  }

  let totalIndexed = 0;
  for (const folder of folders) {
    const count = await scanFolder(folder.id, onStatus);
    totalIndexed += count;
  }

  return totalIndexed;
}

/**
 * Imports multiple files selected manually by user using high-speed concurrent processing
 */
export async function importFiles(
  files: File[],
  onStatus?: (status: SyncStatus) => void
): Promise<number> {
  if (files.length === 0) return 0;

  onStatus?.({ state: 'indexing', message: `Importing ${files.length} items...` });

  let count = 0;
  let processed = 0;

  // Process up to 4 files simultaneously
  const CONCURRENCY = 4;
  let cursor = 0;

  const worker = async () => {
    while (cursor < files.length) {
      const idx = cursor++;
      const file = files[idx];
      try {
        const item = await indexMediaFile(file, {
          storageMode: 'imported',
          folderName: 'Manual Import',
          skipCountUpdate: true,
        });
        if (item) count++;
      } catch (e) {
        console.warn('Import file failed:', file.name, e);
      }

      processed++;
      if (processed % 2 === 0 || processed === files.length) {
        onStatus?.({
          state: 'indexing',
          message: `Importing (${count}/${files.length})...`,
          itemsIndexed: count,
        });
      }
    }
  };

  const pool = Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker);
  await Promise.all(pool);

  // Update album statistics once after batch finishes
  await updateSystemAlbumCounts();

  onStatus?.({
    state: 'success',
    message: `Imported ${count} items into Gallery`,
    itemsIndexed: count,
  });

  return count;
}
