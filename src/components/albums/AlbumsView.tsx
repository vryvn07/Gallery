import React, { useEffect, useState } from 'react';
import {
  Folder,
  Film,
  Camera,
  Download,
  Heart,
  Clock,
  Sparkles,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';
import { db } from '../../services/storage/database';
import type { AlbumRecord, MediaItem } from '../../types/media';

interface AlbumCardProps {
  album: AlbumRecord;
  onClick: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let url: string | null = null;

    async function loadCover() {
      // Find latest media in album to use as cover
      const link = await db.albumMedia.where('albumId').equals(album.id).reverse().first();
      if (!link) return;

      const media = await db.media.get(link.mediaId);
      if (!media || !active) return;

      const blob = media.thumbnailBlob || media.blob;
      if (blob) {
        url = URL.createObjectURL(blob);
        if (active) setCoverUrl(url);
      }
    }

    loadCover();

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [album.id, album.updatedAt]);

  const getSystemIcon = () => {
    switch (album.systemType) {
      case 'videos':
        return <Film className="w-6 h-6 text-indigo-500" />;
      case 'camera':
        return <Camera className="w-6 h-6 text-emerald-500" />;
      case 'screenshots':
        return <Sparkles className="w-6 h-6 text-amber-500" />;
      case 'downloads':
        return <Download className="w-6 h-6 text-sky-500" />;
      case 'favorites':
        return <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />;
      case 'recent':
        return <Clock className="w-6 h-6 text-blue-500" />;
      default:
        return <ImageIcon className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col cursor-pointer group select-none transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-all group-hover:shadow-md">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60">
            {getSystemIcon()}
          </div>
        )}
      </div>

      <div className="mt-2 px-1">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
          {album.title}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {album.itemCount} {album.itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  );
};

export const AlbumsView: React.FC<{ onOpenCreateAlbum: () => void }> = ({ onOpenCreateAlbum }) => {
  const { albums, setActiveAlbumId } = useGallery();

  const systemAlbums = albums.filter((a) => a.isSystem);
  const userAlbums = albums.filter((a) => !a.isSystem);

  return (
    <div className="flex-1 max-w-screen-md mx-auto w-full px-4 py-4 pb-24 space-y-6">
      {/* Auto Categories */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
          Auto Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {systemAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => setActiveAlbumId(album.id)}
            />
          ))}
        </div>
      </section>

      {/* User Albums */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            My Albums
          </h2>
          <button
            onClick={onOpenCreateAlbum}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Create
          </button>
        </div>

        {userAlbums.length === 0 ? (
          <div
            onClick={onOpenCreateAlbum}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors"
          >
            <Folder className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Create your first album</span>
            <span className="text-xs text-slate-400 mt-1">Organize photos into custom folders</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => setActiveAlbumId(album.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
