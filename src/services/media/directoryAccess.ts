/**
 * Browser File System Access API helpers and capability detection
 */

export function isDirectoryPickerSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function requestDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!isDirectoryPickerSupported()) {
    throw new Error('Directory access is not supported in this browser.');
  }

  try {
    const handle = await window.showDirectoryPicker({
      id: 'gallery_local_folder',
      mode: 'read',
    });
    return handle;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null; // User cancelled picker
    }
    throw err;
  }
}

export async function verifyDirectoryPermission(
  handle: FileSystemDirectoryHandle,
  mode: 'read' | 'readwrite' = 'read'
): Promise<boolean> {
  try {
    const queryOpts: FileSystemHandlePermissionDescriptor = { mode };
    // Check if permission was already granted
    if ((await handle.queryPermission(queryOpts)) === 'granted') {
      return true;
    }
    // Request permission if not yet granted
    if ((await handle.requestPermission(queryOpts)) === 'granted') {
      return true;
    }
  } catch (err) {
    console.warn('Permission query/request failed:', err);
  }
  return false;
}

export interface DiscoveredFileEntry {
  file: File;
  name: string;
  relativePath: string;
  handle: FileSystemFileHandle;
}

/**
 * Traverses a directory handle up to a maximum depth to find files
 */
export async function scanDirectoryEntries(
  dirHandle: FileSystemDirectoryHandle,
  maxDepth = 2,
  currentDepth = 0,
  basePath = ''
): Promise<DiscoveredFileEntry[]> {
  const results: DiscoveredFileEntry[] = [];

  for await (const [name, entry] of (dirHandle as any).entries()) {
    if (name.startsWith('.')) continue; // Skip hidden system files

    const currentPath = basePath ? `${basePath}/${name}` : name;

    if (entry.kind === 'file') {
      try {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        results.push({
          file,
          name,
          relativePath: currentPath,
          handle: fileHandle,
        });
      } catch (err) {
        console.warn(`Could not read file ${name}:`, err);
      }
    } else if (entry.kind === 'directory' && currentDepth < maxDepth) {
      try {
        const subDirHandle = entry as FileSystemDirectoryHandle;
        const subEntries = await scanDirectoryEntries(
          subDirHandle,
          maxDepth,
          currentDepth + 1,
          currentPath
        );
        results.push(...subEntries);
      } catch (err) {
        console.warn(`Could not read sub-directory ${name}:`, err);
      }
    }
  }

  return results;
}
