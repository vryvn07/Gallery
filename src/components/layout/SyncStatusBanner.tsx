import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';

export const SyncStatusBanner: React.FC = () => {
  const { syncStatus, rescanFolders } = useGallery();

  const isVisible =
    syncStatus.state === 'checking' ||
    syncStatus.state === 'indexing' ||
    syncStatus.state === 'permission_required';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 dark:bg-blue-950/60 border-b border-blue-100 dark:border-blue-900/50 px-4 py-2.5 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200"
        >
          <div className="flex items-center gap-2 truncate">
            {syncStatus.state === 'permission_required' ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : syncStatus.state === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
            )}
            <span className="font-medium truncate">{syncStatus.message}</span>
          </div>

          {syncStatus.state === 'permission_required' && (
            <button
              onClick={() => rescanFolders()}
              className="ml-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs whitespace-nowrap transition-colors"
            >
              Grant Permission
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
