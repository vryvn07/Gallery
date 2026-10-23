import React, { useState, useEffect } from 'react';
import { useGallery } from './context/GalleryContext';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { SyncStatusBanner } from './components/layout/SyncStatusBanner';
import { Toast } from './components/layout/Toast';
import { PhotosGrid } from './components/gallery/PhotosGrid';
import { SelectionActionBar } from './components/gallery/SelectionActionBar';
import { AlbumsView } from './components/albums/AlbumsView';
import { AlbumDetailView } from './components/albums/AlbumDetailView';
import { SearchView } from './components/search/SearchView';
import { SettingsView } from './components/settings/SettingsView';
import { MediaViewer } from './components/viewer/MediaViewer';
import { PhotoEditorModal } from './components/editor/PhotoEditorModal';
import { CreateAlbumModal } from './components/dialogs/CreateAlbumModal';
import { AddToAlbumModal } from './components/dialogs/AddToAlbumModal';
import { RecentlyDeletedModal } from './components/dialogs/RecentlyDeletedModal';

export const GalleryAppContent: React.FC = () => {
  const {
    activeTab,
    activeAlbumId,
    setActiveAlbumId,
    mediaList,
    selectedIds,
    isLoading,
    activeViewerIndex,
    closeViewer,
    editingItem,
    closeEditor,
    detailsItem,
    closeDetails,
    isSelectionMode,
    deselectAll,
  } = useGallery();

  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [isAddToAlbumOpen, setIsAddToAlbumOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Push history state whenever an overlay or drilled-down view opens
  useEffect(() => {
    const hasOverlay =
      detailsItem !== null ||
      editingItem !== null ||
      activeViewerIndex !== null ||
      isTrashOpen ||
      isCreateAlbumOpen ||
      isAddToAlbumOpen ||
      isSelectionMode ||
      activeAlbumId !== null;

    if (hasOverlay) {
      window.history.pushState({ galleryOverlay: true }, '');
    }
  }, [
    detailsItem !== null,
    editingItem !== null,
    activeViewerIndex !== null,
    isTrashOpen,
    isCreateAlbumOpen,
    isAddToAlbumOpen,
    isSelectionMode,
    activeAlbumId !== null,
  ]);

  // Handle Android device back button and browser popstate
  useEffect(() => {
    const handlePopState = () => {
      if (detailsItem) {
        closeDetails();
        return;
      }
      if (editingItem) {
        closeEditor();
        return;
      }
      if (activeViewerIndex !== null) {
        closeViewer();
        return;
      }
      if (isTrashOpen) {
        setIsTrashOpen(false);
        return;
      }
      if (isCreateAlbumOpen) {
        setIsCreateAlbumOpen(false);
        return;
      }
      if (isAddToAlbumOpen) {
        setIsAddToAlbumOpen(false);
        return;
      }
      if (isSelectionMode) {
        deselectAll();
        return;
      }
      if (activeAlbumId) {
        setActiveAlbumId(null);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    detailsItem,
    editingItem,
    activeViewerIndex,
    isTrashOpen,
    isCreateAlbumOpen,
    isAddToAlbumOpen,
    isSelectionMode,
    activeAlbumId,
    closeDetails,
    closeEditor,
    closeViewer,
    deselectAll,
    setActiveAlbumId,
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Non-blocking sync status banner */}
      <SyncStatusBanner />

      {/* Main App Header */}
      <AppHeader
        onOpenCreateAlbum={() => setIsCreateAlbumOpen(true)}
        onOpenAddPhotosToAlbum={() => setIsAddToAlbumOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'photos' && <PhotosGrid media={mediaList} />}

            {activeTab === 'albums' && (
              activeAlbumId ? (
                <AlbumDetailView
                  albumId={activeAlbumId}
                  onOpenAddPhotos={() => setIsAddToAlbumOpen(true)}
                />
              ) : (
                <AlbumsView onOpenCreateAlbum={() => setIsCreateAlbumOpen(true)} />
              )
            )}

            {activeTab === 'search' && <SearchView />}

            {activeTab === 'settings' && (
              <SettingsView onOpenTrash={() => setIsTrashOpen(true)} />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Floating Selection Mode Action Bar */}
      <SelectionActionBar onOpenAddToAlbum={() => setIsAddToAlbumOpen(true)} />

      {/* Full-Screen Media Viewer */}
      <MediaViewer />

      {/* Built-in Photo Editor Modal */}
      <PhotoEditorModal />

      {/* Dialog Modals */}
      <CreateAlbumModal
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
        initialSelectedIds={Array.from(selectedIds)}
      />

      <AddToAlbumModal
        isOpen={isAddToAlbumOpen}
        onClose={() => setIsAddToAlbumOpen(false)}
        onOpenCreateAlbum={() => setIsCreateAlbumOpen(true)}
      />

      <RecentlyDeletedModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
      />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};
