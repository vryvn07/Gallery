import { db } from '../storage/database';
import { generateImageThumbnail } from './thumbnailService';
import type { MediaItem } from '../../types/media';

interface SampleSpec {
  name: string;
  width: number;
  height: number;
  timeOffsetDays: number;
  category: 'camera' | 'screenshot' | 'general';
  exif: {
    make: string;
    model: string;
    fNumber: number;
    exposureTime: string;
    iso: number;
    focalLength: number;
  };
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const SAMPLE_SPECS: SampleSpec[] = [
  {
    name: 'IMG_20261022_Alpine_Sunset.jpg',
    width: 1920,
    height: 1280,
    timeOffsetDays: 0,
    category: 'camera',
    exif: {
      make: 'Galaxy',
      model: 'S24 Ultra',
      fNumber: 1.7,
      exposureTime: '1/250s',
      iso: 50,
      focalLength: 24,
    },
    draw: (ctx, w, h) => {
      // Sunset Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
      sky.addColorStop(0, '#1e1b4b');
      sky.addColorStop(0.3, '#701a75');
      sky.addColorStop(0.6, '#ea580c');
      sky.addColorStop(1, '#fde047');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Sun
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w * 0.65, h * 0.5, 90, 0, Math.PI * 2);
      ctx.fill();

      // Mountains
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.25, h * 0.4);
      ctx.lineTo(w * 0.45, h * 0.65);
      ctx.lineTo(w * 0.7, h * 0.35);
      ctx.lineTo(w, h * 0.8);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    name: 'Screenshot_20261021_MobileDashboard.png',
    width: 1080,
    height: 1920,
    timeOffsetDays: 1,
    category: 'screenshot',
    exif: {
      make: 'Android',
      model: 'Device System',
      fNumber: 0,
      exposureTime: '',
      iso: 0,
      focalLength: 0,
    },
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, w, h);

      // Top status bar
      ctx.fillStyle = '#1e2230';
      ctx.fillRect(0, 0, w, 80);

      // Cards
      const cardGrad = ctx.createLinearGradient(60, 200, w - 120, 480);
      cardGrad.addColorStop(0, '#2563eb');
      cardGrad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = cardGrad;
      ctx.beginPath();
      ctx.roundRect(60, 200, w - 120, 320, 32);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('Gallery Analytics', 110, 300);

      ctx.fillStyle = '#181b24';
      ctx.beginPath();
      ctx.roundRect(60, 580, w - 120, 240, 24);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(60, 860, w - 120, 240, 24);
      ctx.fill();
    },
  },
  {
    name: 'IMG_20261019_Coastal_Serenity.jpg',
    width: 1600,
    height: 1200,
    timeOffsetDays: 3,
    category: 'camera',
    exif: {
      make: 'Sony',
      model: 'Alpha 7 IV',
      fNumber: 2.8,
      exposureTime: '1/1000s',
      iso: 100,
      focalLength: 35,
    },
    draw: (ctx, w, h) => {
      // Ocean gradient
      const sea = ctx.createLinearGradient(0, 0, 0, h);
      sea.addColorStop(0, '#38bdf8');
      sea.addColorStop(0.45, '#0284c7');
      sea.addColorStop(0.7, '#0f766e');
      sea.addColorStop(1, '#fef08a');
      ctx.fillStyle = sea;
      ctx.fillRect(0, 0, w, h);

      // Horizon sun beam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(0, h * 0.42, w, 20);
    },
  },
  {
    name: 'IMG_20261015_Neon_Metropolis.jpg',
    width: 1440,
    height: 1440,
    timeOffsetDays: 7,
    category: 'camera',
    exif: {
      make: 'Galaxy',
      model: 'S24 Ultra',
      fNumber: 1.7,
      exposureTime: '1/30s',
      iso: 640,
      focalLength: 50,
    },
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);

      // Neon buildings
      const neon1 = ctx.createLinearGradient(0, 0, 0, h);
      neon1.addColorStop(0, '#06b6d4');
      neon1.addColorStop(1, '#ec4899');
      ctx.fillStyle = neon1;

      ctx.fillRect(100, 300, 180, h - 300);
      ctx.fillRect(340, 180, 220, h - 180);
      ctx.fillRect(620, 400, 200, h - 400);
      ctx.fillRect(880, 240, 260, h - 240);
      ctx.fillRect(1200, 360, 180, h - 360);
    },
  },
];

/**
 * Generates synthetic sample photos so users can immediately test the viewer,
 * editor, albums, and organization without importing device files first.
 */
export async function populateSampleMedia(): Promise<number> {
  const canvas = document.createElement('canvas');
  let addedCount = 0;
  const now = Date.now();

  for (const spec of SAMPLE_SPECS) {
    canvas.width = spec.width;
    canvas.height = spec.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    spec.draw(ctx, spec.width, spec.height);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.9);
    });

    const file = new File([blob], spec.name, {
      type: 'image/jpeg',
      lastModified: now - spec.timeOffsetDays * 86400000,
    });

    const thumbResult = await generateImageThumbnail(file);
    const id = `sample_${Date.now()}_${addedCount}`;
    const captureDate = file.lastModified;

    const item: MediaItem = {
      id,
      name: spec.name,
      type: 'image',
      mimeType: 'image/jpeg',
      size: blob.size,
      createdAt: captureDate,
      modifiedAt: captureDate,
      captureDate,
      storageMode: 'imported',
      folderName: spec.category === 'screenshot' ? 'Screenshots' : 'Camera',
      blob,
      thumbnailBlob: thumbResult.thumbnailBlob,
      width: spec.width,
      height: spec.height,
      isFavorite: addedCount === 0, // First sample is favorite
      isTrash: false,
      exif: spec.exif,
    };

    await db.media.put(item);

    // Link to system albums
    await db.albumMedia.put({
      id: `sys_all_${id}`,
      albumId: 'sys_all',
      mediaId: id,
      addedAt: captureDate,
    });

    if (spec.category === 'screenshot') {
      await db.albumMedia.put({
        id: `sys_screenshots_${id}`,
        albumId: 'sys_screenshots',
        mediaId: id,
        addedAt: captureDate,
      });
    } else {
      await db.albumMedia.put({
        id: `sys_camera_${id}`,
        albumId: 'sys_camera',
        mediaId: id,
        addedAt: captureDate,
      });
    }

    if (item.isFavorite) {
      await db.albumMedia.put({
        id: `sys_favorites_${id}`,
        albumId: 'sys_favorites',
        mediaId: id,
        addedAt: captureDate,
      });
    }

    addedCount++;
  }

  // Update album item counts
  for (const albumId of ['sys_all', 'sys_camera', 'sys_screenshots', 'sys_favorites']) {
    const count = await db.albumMedia.where('albumId').equals(albumId).count();
    await db.albums.update(albumId, { itemCount: count, updatedAt: Date.now() });
  }

  return addedCount;
}
