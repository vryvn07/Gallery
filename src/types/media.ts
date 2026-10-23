export type MediaType = 'image' | 'video';

export type StorageMode = 'referenced' | 'imported';

export interface ExifData {
  make?: string;
  model?: string;
  fNumber?: number;
  exposureTime?: number | string;
  iso?: number;
  focalLength?: number;
  lensModel?: string;
  dateTimeOriginal?: Date | string;
  latitude?: number;
  longitude?: number;
  orientation?: number;
}

export interface MediaItem {
  id: string; // unique identifier
  name: string;
  type: MediaType;
  mimeType: string;
  size: number; // bytes
  createdAt: number; // timestamp
  modifiedAt: number; // timestamp
  captureDate: number; // timestamp for grouping
  storageMode: StorageMode;
  folderId?: string; // ID of the source folder
  folderName?: string;
  relativePath?: string; // Relative path in folder
  
  // Stored binary content (only for imported items or local thumbnails)
  blob?: Blob;
  thumbnailBlob?: Blob;
  
  // Dimensions and duration
  width?: number;
  height?: number;
  duration?: number; // Video duration in seconds
  
  // State flags
  isFavorite: boolean;
  isTrash: boolean;
  trashedAt?: number;
  
  // Extracted metadata
  exif?: ExifData;
}

export interface FolderRecord {
  id: string;
  name: string;
  handle?: FileSystemDirectoryHandle;
  permission: 'granted' | 'prompt' | 'denied';
  itemCount: number;
  lastSyncedAt?: number;
  createdAt: number;
}

export interface AlbumRecord {
  id: string;
  title: string;
  isSystem?: boolean;
  systemType?: 'all' | 'videos' | 'screenshots' | 'camera' | 'downloads' | 'favorites' | 'recent';
  coverMediaId?: string;
  itemCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface AlbumMediaRecord {
  id: string;
  albumId: string;
  mediaId: string;
  addedAt: number;
}

export type GridDensity = 'compact' | 'comfortable' | 'expanded'; // 5, 4, 3 columns

export type SortOrder = 'newest' | 'oldest' | 'name' | 'size';

export interface UserSettings {
  theme: 'light' | 'dark'; // Strictly 'light' default
  gridDensity: GridDensity;
  defaultSort: SortOrder;
  autoSyncOnForeground: boolean;
  searchHistory: string[];
}

export interface StorageEstimateInfo {
  usage: number; // bytes
  quota: number; // bytes
  percentUsed: number;
  persisted: boolean;
}

export interface SyncStatus {
  state: 'idle' | 'checking' | 'indexing' | 'success' | 'permission_required' | 'unsupported' | 'error';
  message: string;
  itemsIndexed?: number;
}

export interface EditAdjustments {
  brightness: number; // -100 to +100 (0 default)
  contrast: number; // -100 to +100 (0 default)
  saturation: number; // -100 to +100 (0 default)
  temperature: number; // -100 to +100 (0 default)
  exposure: number; // -100 to +100 (0 default)
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  filter: 'none' | 'vivid' | 'warm' | 'cool' | 'dramatic' | 'grayscale' | 'sepia' | 'vintage';
  cropRect?: {
    x: number; // 0 to 1 normalized
    y: number; // 0 to 1 normalized
    width: number; // 0 to 1 normalized
    height: number; // 0 to 1 normalized
  };
}
