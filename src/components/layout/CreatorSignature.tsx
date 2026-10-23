import React from 'react';
import { ArrowUpRight, Sparkles, User } from 'lucide-react';
import { CREATOR_INFO } from '../dialogs/CreatorModal';

interface CreatorSignatureProps {
  onOpenModal?: () => void;
  className?: string;
  variant?: 'compact' | 'pill' | 'card';
}

export const CreatorSignature: React.FC<CreatorSignatureProps> = ({
  onOpenModal,
  className = '',
  variant = 'pill',
}) => {
  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between transition-colors ${className}`}>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 p-0.5 shadow-md flex-shrink-0">
            <img
              src={CREATOR_INFO.avatar}
              alt={CREATOR_INFO.name}
              className="w-full h-full object-cover object-top rounded-[14px]"
            />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{CREATOR_INFO.name}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {CREATOR_INFO.role}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
              Profile
            </button>
          )}
          <a
            href={CREATOR_INFO.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            <span>Portfolio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      <button
        onClick={onOpenModal}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-medium transition-all group border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
        title="View Creator & Architect Profile"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-blue-500/30 flex-shrink-0 -ml-1">
          <img
            src={CREATOR_INFO.avatar}
            alt={CREATOR_INFO.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <span>Crafted by <strong className="font-semibold text-slate-900 dark:text-white">{CREATOR_INFO.name}</strong></span>
      </button>

      <a
        href={CREATOR_INFO.portfolio}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Open Aryan Singh's Portfolio"
        aria-label="Open Aryan Singh's Portfolio"
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
