import React from 'react';
import { Image, FolderClosed, Search, Settings } from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';

export const BottomNavigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setActiveAlbumId,
    isSelectionMode,
    activeViewerIndex,
    editingItem,
  } = useGallery();

  // Hide bottom navigation when in full-screen viewer, photo editor, or selection mode
  if (activeViewerIndex !== null || editingItem !== null || isSelectionMode) {
    return null;
  }

  const tabs = [
    {
      id: 'photos' as const,
      label: 'Photos',
      icon: Image,
    },
    {
      id: 'albums' as const,
      label: 'Albums',
      icon: FolderClosed,
    },
    {
      id: 'search' as const,
      label: 'Search',
      icon: Search,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#12141c]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors duration-200">
      <div className="max-w-screen-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'albums') {
                  setActiveAlbumId(null);
                }
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors duration-200 ${
                  isActive ? 'bg-blue-50 dark:bg-blue-950/50' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform duration-200" />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
