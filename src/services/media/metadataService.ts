import exifr from 'exifr';
import type { ExifData } from '../../types/media';

/**
 * Extracts EXIF camera metadata safely from an image File or Blob with timeout protection
 */
export async function extractExifMetadata(fileOrBlob: Blob): Promise<ExifData | undefined> {
  // Only attempt EXIF on image formats that support it (JPEG, TIFF, WebP, HEIC)
  if (!fileOrBlob.type.startsWith('image/')) {
    return undefined;
  }

  try {
    const parsePromise = exifr.parse(fileOrBlob, {
      tiff: true,
      exif: true,
      gps: true,
      pick: [
        'Make',
        'Model',
        'FNumber',
        'ExposureTime',
        'ISO',
        'FocalLength',
        'LensModel',
        'DateTimeOriginal',
        'latitude',
        'longitude',
        'Orientation',
      ],
    });

    // 600ms timeout guard to prevent hangs on corrupted or invalid file headers
    const timeoutPromise = new Promise<undefined>((resolve) =>
      setTimeout(() => resolve(undefined), 600)
    );

    const raw = await Promise.race([parsePromise, timeoutPromise]);
    if (!raw) return undefined;

    const exif: ExifData = {};
    if (raw.Make) exif.make = String(raw.Make).trim();
    if (raw.Model) exif.model = String(raw.Model).trim();
    if (raw.FNumber) exif.fNumber = Number(raw.FNumber);
    if (raw.ExposureTime) {
      if (typeof raw.ExposureTime === 'number') {
        exif.exposureTime = raw.ExposureTime < 1 ? `1/${Math.round(1 / raw.ExposureTime)}` : `${raw.ExposureTime}s`;
      } else {
        exif.exposureTime = String(raw.ExposureTime);
      }
    }
    if (raw.ISO) exif.iso = Number(raw.ISO);
    if (raw.FocalLength) exif.focalLength = Number(raw.FocalLength);
    if (raw.LensModel) exif.lensModel = String(raw.LensModel).trim();
    if (raw.DateTimeOriginal) exif.dateTimeOriginal = raw.DateTimeOriginal;
    if (typeof raw.latitude === 'number') exif.latitude = raw.latitude;
    if (typeof raw.longitude === 'number') exif.longitude = raw.longitude;
    if (raw.Orientation) exif.orientation = Number(raw.Orientation);

    return exif;
  } catch (err) {
    // Non-blocking: images without EXIF or with corrupted headers are handled safely
    return undefined;
  }
}
