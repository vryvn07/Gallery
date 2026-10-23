import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Globe,
  Film,
  Mail,
  MapPin,
  Sparkles,
  Layers,
} from 'lucide-react';
import creatorAvatar from '../../assets/creator/aryan-singh.jpg';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CREATOR_INFO = {
  name: 'Aryan Singh',
  role: 'Creator & Lead Platform Architect',
  tagline: 'Software Architect & Platform Engineer | Independent Filmmaker',
  location: 'Gorakhpur, Uttar Pradesh, India',
  portfolio: 'https://aryan-cine-dev-portfolio.vercel.app/',
  github: 'https://github.com/aryansingh0777raghav',
  linkedin: 'https://www.linkedin.com/in/iamaryan07',
  imdb: 'https://www.imdb.com/name/nm18214429/',
  instagram: 'https://www.instagram.com/iam_aryannnn07',
  email: 'aryansingh979211@gmail.com',
  bio: 'Software Architect and Independent Filmmaker specializing in zero-latency systems, local-first architectures, and high-craft digital products.',
  flagships: ['ArKTest Beta', 'ArCV', 'CarHari', 'VnishAr', 'CineOn Studio 7'],
  avatar: creatorAvatar || '/creator/aryan-singh.jpg',
};

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-lg bg-white dark:bg-[#181b24] text-slate-900 dark:text-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 max-h-[90vh] overflow-y-auto pb-safe relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header & Avatar */}
          <div className="flex flex-col items-center text-center pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 p-0.5 shadow-xl ring-4 ring-blue-500/15 overflow-hidden">
                {!imageError ? (
                  <img
                    src={CREATOR_INFO.avatar}
                    alt={CREATOR_INFO.name}
                    className="w-full h-full object-cover object-top rounded-[14px]"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-white dark:bg-[#12141c] rounded-[14px] flex items-center justify-center">
                    <span className="font-extrabold text-2xl tracking-tighter bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                      AS
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Aryan Singh — Platform Architect & Creator
            </h2>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              {CREATOR_INFO.role}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {CREATOR_INFO.tagline}
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{CREATOR_INFO.location}</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Architecture & Vision
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {CREATOR_INFO.bio}
            </p>
          </div>

          {/* Notable Flagships */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Notable Flagships</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CREATOR_INFO.flagships.map((f, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Action Pills: Portfolio, GitHub, LinkedIn */}
          <div className="pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Connect & Portfolio
            </h3>

            {/* Main Portfolio Link */}
            <a
              href={CREATOR_INFO.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-xs font-semibold">Official Cine-Dev Portfolio</div>
                  <div className="text-[11px] text-blue-600/70 dark:text-blue-400/70">aryan-cine-dev-portfolio.vercel.app</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={CREATOR_INFO.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={CREATOR_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-200/60 dark:border-slate-700 transition-colors shadow-sm"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href={CREATOR_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-200/60 dark:border-slate-700 transition-colors shadow-sm"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-[#0077b5]" />
                <span>LinkedIn</span>
              </a>
            </div>

            {/* Social pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={CREATOR_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span className="truncate">GitHub</span>
              </a>

              <a
                href={CREATOR_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4 text-[#0077b5]" />
                <span className="truncate">LinkedIn</span>
              </a>

              <a
                href={CREATOR_INFO.imdb}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Film className="w-4 h-4 text-amber-500" />
                <span className="truncate">IMDb</span>
              </a>

              <a
                href={CREATOR_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-pink-500" />
                <span className="truncate">Instagram</span>
              </a>
            </div>

            {/* Email Contact */}
            <a
              href={`mailto:${CREATOR_INFO.email}`}
              className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{CREATOR_INFO.email}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
