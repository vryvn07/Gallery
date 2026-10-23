import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, HardDrive, Camera, MapPin, Film, Image as ImageIcon } from 'lucide-react';
import type { MediaItem } from '../../types/media';
import { formatBytes } from '../../services/storage/storageQuota';

interface MediaInfoModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const MediaInfoModal: React.FC<MediaInfoModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const dateObj = new Date(item.captureDate);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const megaPixels =
    item.width && item.height
      ? (Math.round((item.width * item.height) / 100000) / 10).toFixed(1)
      : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-full max-w-md bg-white dark:bg-[#181b24] text-slate-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto pb-safe"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold">Details</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-5 text-sm">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">{formattedDate}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{formattedTime}</div>
              </div>
            </div>

            {/* File Info */}
            <div className="flex items-start gap-3">
              {item.type === 'video' ? (
                <Film className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              ) : (
                <ImageIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-100 break-all">{item.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 space-x-2">
                  <span>{formatBytes(item.size)}</span>
                  {item.width && item.height && (
                    <>
                      <span>•</span>
                      <span>
                        {item.width} × {item.height} {megaPixels ? `(${megaPixels} MP)` : ''}
                      </span>
                    </>
                  )}
                  {item.duration && (
                    <>
                      <span>•</span>
                      <span>{Math.round(item.duration)}s</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Camera / EXIF Info */}
            {item.exif && (item.exif.model || item.exif.fNumber || item.exif.iso) && (
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    {item.exif.make ? `${item.exif.make} ` : ''}
                    {item.exif.model || 'Camera'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {item.exif.focalLength && <span>{item.exif.focalLength} mm</span>}
                    {item.exif.fNumber && <span>f/{item.exif.fNumber}</span>}
                    {item.exif.exposureTime && <span>{item.exif.exposureTime}</span>}
                    {item.exif.iso && <span>ISO {item.exif.iso}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Location (if present) */}
            {item.exif?.latitude && item.exif?.longitude && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">Location</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.exif.latitude.toFixed(4)}°, {item.exif.longitude.toFixed(4)}°
                  </div>
                </div>
              </div>
            )}

            {/* Storage Mode & Source */}
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {item.storageMode === 'referenced' ? 'Referenced from Folder' : 'Imported Media'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.storageMode === 'referenced'
                    ? `Folder: ${item.folderName || 'Local Device'}${item.relativePath ? ` • Path: ${item.relativePath}` : ''}`
                    : 'Stored securely in browser IndexedDB storage'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
