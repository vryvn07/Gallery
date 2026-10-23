import exifr from 'exifr';
import type { ExifData } from '../../types/media';

/**
 * Extracts EXIF camera metadata safely from an image File or Blob with high performance
 */
export async function extractExifMetadata(fileOrBlob: Blob): Promise<ExifData | undefined> {
  // Only attempt EXIF on image formats that support it (JPEG, TIFF, WebP, HEIC)
  if (!fileOrBlob.type.startsWith('image/')) {
    return undefined;
  }

  // Non-EXIF image types can be skipped to avoid unnecessary processing
  if (
    fileOrBlob.type === 'image/svg+xml' ||
    fileOrBlob.type === 'image/gif' ||
    fileOrBlob.type === 'image/png'
  ) {
    return undefined;
  }

  try {
    // Slicing first 131,072 bytes (128 KB) avoids reading multi-megabyte files into memory,
    // as EXIF metadata headers reside strictly in the file header.
    const slice = fileOrBlob.size > 131072 ? fileOrBlob.slice(0, 131072) : fileOrBlob;

    const parsePromise = exifr.parse(slice, {
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

    // 250ms timeout guard to prevent hangs on corrupted or invalid file headers
    const timeoutPromise = new Promise<undefined>((resolve) =>
      setTimeout(() => resolve(undefined), 250)
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
  } catch {
    // Non-blocking: images without EXIF or with corrupted headers are handled safely
    return undefined;
  }
}
