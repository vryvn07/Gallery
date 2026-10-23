import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';

export const Toast: React.FC = () => {
  const { toast } = useGallery();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 max-w-sm w-full"
        >
          <div className="bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {(!toast.type || toast.type === 'info') && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="truncate">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
