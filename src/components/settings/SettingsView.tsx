import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  FolderPlus,
  RefreshCw,
  Upload,
  Trash2,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  ChevronRight,
  Database,
  Smartphone,
  Sparkles,
  Download,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useGallery } from '../../context/GalleryContext';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import {
  getStorageEstimate,
  clearThumbnailCache,
  formatBytes,
} from '../../services/storage/storageQuota';
import { isDirectoryPickerSupported } from '../../services/media/directoryAccess';
import { db } from '../../services/storage/database';
import { CreatorSignature } from '../layout/CreatorSignature';
import type { StorageEstimateInfo } from '../../types/media';

interface SettingsViewProps {
  onOpenTrash: () => void;
  onOpenCreatorProfile?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenTrash,
  onOpenCreatorProfile,
}) => {
  const { theme, setTheme } = useTheme();
  const {
    folders,
    removeFolder,
    rescanFolders,
    connectNewFolder,
    importManualFiles,
    loadSamplePhotos,
    gridDensity,
    setGridDensity,
    trashedList,
    showToast,
  } = useGallery();

  const { canInstall, isInstalled, triggerInstall } = useInstallPrompt();
  const [storageInfo, setStorageInfo] = useState<StorageEstimateInfo | null>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);

  useEffect(() => {
    getStorageEstimate().then(setStorageInfo);
  }, []);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const cleared = await clearThumbnailCache();
      showToast(`Cleared ${cleared} cached thumbnails`, 'info');
      const updated = await getStorageEstimate();
      setStorageInfo(updated);
    } catch (e: any) {
      showToast(e.message || 'Failed to clear cache', 'error');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const allAlbums = await db.albums.toArray();
      const allSettings = await db.settings.toArray();
      const allMedia = await db.media.toArray();

      const backup = {
        app: 'Gallery',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        albums: allAlbums,
        settings: allSettings,
        mediaCount: allMedia.length,
        items: allMedia.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          size: m.size,
          captureDate: m.captureDate,
          storageMode: m.storageMode,
          folderName: m.folderName,
          relativePath: m.relativePath,
          isFavorite: m.isFavorite,
          exif: m.exif,
        })),
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gallery_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast('Exported metadata backup', 'success');
    } catch (err: any) {
      showToast('Backup export failed', 'error');
    }
  };

  const handleClearAllData = async () => {
    if (
      window.confirm(
        'Warning: Clear all Gallery application data? This removes your local index, albums, and preferences. Original device files in folders will NOT be deleted.'
      )
    ) {
      await db.delete();
      localStorage.clear();
      window.location.reload();
    }
  };

  const hasDirectoryPicker = isDirectoryPickerSupported();
  const hasWebShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className="flex-1 max-w-screen-md mx-auto w-full px-4 py-4 pb-24 space-y-6">
      {/* 0. PWA Installation Banner if installable */}
      {canInstall && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Install Gallery App</div>
              <div className="text-xs text-blue-100">Standalone edge-to-edge experience</div>
            </div>
          </div>
          <button
            onClick={() => triggerInstall()}
            className="px-4 py-2 bg-white text-blue-600 font-bold text-xs rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
          >
            Install
          </button>
        </section>
      )}

      {/* 1. Theme Selection Section */}
      <section className="bg-white dark:bg-[#181b24] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Theme & Display
        </h2>

        {/* Clear Light / Dark Theme Toggle with Sun and Moon Icons */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white">Appearance</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current theme: <span className="font-medium capitalize text-blue-600 dark:text-blue-400">{theme} Mode</span>
            </div>
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              aria-label="Light mode"
            >
              <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-500' : ''}`} />
              <span>Light</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-[#222533] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-200 dark:text-slate-400'
              }`}
              aria-label="Dark mode"
            >
              <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-indigo-400' : ''}`} />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Grid Density */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white">Grid Density</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Thumbnail size in Photos tab
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(
              [
                { id: 'compact', label: '5 cols' },
                { id: 'comfortable', label: '4 cols' },
                { id: 'expanded', label: '3 cols' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => setGridDensity(d.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  gridDensity === d.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Folder Access Management */}
      <section className="bg-white dark:bg-[#181b24] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Local Media Folders
          </h2>
          <button
            onClick={() => rescanFolders()}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Rescan All</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          The app automatically checks connected device folders on launch without uploading photos to any server.
        </p>

        {/* Connected Folders List */}
        <div className="space-y-2 mb-4">
          {folders.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
            >
              <div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{f.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {f.itemCount} items indexed • Status:{' '}
                  <span className={f.permission === 'granted' ? 'text-emerald-500' : 'text-amber-500'}>
                    {f.permission === 'granted' ? 'Connected' : 'Permission required'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => removeFolder(f.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove folder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {folders.length === 0 && (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No folders connected yet.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={() => connectNewFolder()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Connect Folder (DCIM / Pictures)</span>
          </button>

          <button
            onClick={() => importManualFiles()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Files</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <button
            onClick={() => loadSamplePhotos()}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Photos</span>
          </button>
        </div>
      </section>

      {/* 3. Recently Deleted Trash Section */}
      <section className="bg-white dark:bg-[#181b24] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <button
          onClick={onOpenTrash}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Recently Deleted
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {trashedList.length} {trashedList.length === 1 ? 'item' : 'items'} in trash
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </section>

      {/* 4. Storage & Cache Management */}
      <section className="bg-white dark:bg-[#181b24] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Storage & Diagnostics
        </h2>

        {storageInfo && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1.5">
              <span>Browser Storage Used</span>
              <span className="font-medium">
                {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(1, storageInfo.percentUsed))}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white">Thumbnail Cache</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clear cached thumbnails to free storage
            </div>
          </div>
          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {isClearingCache ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white">Export Metadata Backup</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download JSON backup of albums and catalog
            </div>
          </div>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-semibold text-sm text-rose-600 dark:text-rose-400">Clear Application Data</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Resets gallery settings and index
            </div>
          </div>
          <button
            onClick={handleClearAllData}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors"
          >
            Reset
          </button>
        </div>
      </section>

      {/* 5. Browser Capabilities Checklist */}
      <section className="bg-white dark:bg-[#181b24] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Browser Capabilities
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-300">File System Access API (Folder handles)</span>
            <span className="flex items-center gap-1 font-medium">
              {hasDirectoryPicker ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Supported</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Fallback mode</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-300">Web Share API</span>
            <span className="flex items-center gap-1 font-medium">
              {hasWebShare ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Supported</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Download fallback</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-300">PWA & Offline Service Worker</span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                {isInstalled ? 'Installed' : 'Active'}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* 6. Creator & Platform Architect */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          Creator & Architect
        </h2>
        <CreatorSignature variant="card" onOpenModal={onOpenCreatorProfile} />
      </section>

      {/* 7. Privacy & About */}
      <section className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-1">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Privacy First Architecture</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Gallery has no backend server, no tracking, and no external analytics. Your photos never leave your device.
        </p>
        <div className="text-[11px] text-slate-400 pt-2 font-mono">
          Gallery v1.0.0 • Samsung Gallery-Inspired PWA
        </div>
      </section>
    </div>
  );
};
