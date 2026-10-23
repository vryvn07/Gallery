import type { EditAdjustments } from '../../types/media';

export const DEFAULT_ADJUSTMENTS: EditAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  exposure: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  filter: 'none',
  cropRect: undefined,
};

/**
 * Applies adjustments, rotations, flips, filters, and crops to an image element onto a Canvas
 */
export function renderEditedImageToCanvas(
  sourceImg: HTMLImageElement,
  canvas: HTMLCanvasElement,
  adjustments: EditAdjustments
): void {
  const origWidth = sourceImg.naturalWidth || sourceImg.width;
  const origHeight = sourceImg.naturalHeight || sourceImg.height;

  // Calculate crop rectangle in pixel coordinates
  const crop = adjustments.cropRect || { x: 0, y: 0, width: 1, height: 1 };
  const sx = crop.x * origWidth;
  const sy = crop.y * origHeight;
  const sWidth = crop.width * origWidth;
  const sHeight = crop.height * origHeight;

  // Determine orientation rotation
  const isRotated90or270 = adjustments.rotation === 90 || adjustments.rotation === 270;
  canvas.width = Math.round(isRotated90or270 ? sHeight : sWidth);
  canvas.height = Math.round(isRotated90or270 ? sWidth : sHeight);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.save();

  // Handle Rotation and Flipping around center
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((adjustments.rotation * Math.PI) / 180);
  ctx.scale(adjustments.flipH ? -1 : 1, adjustments.flipV ? -1 : 1);

  // Apply CSS filters on context
  const b = 100 + adjustments.brightness;
  const c = 100 + adjustments.contrast;
  const s = 100 + adjustments.saturation;

  let filterStr = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

  if (adjustments.filter === 'grayscale') {
    filterStr += ' grayscale(100%)';
  } else if (adjustments.filter === 'sepia') {
    filterStr += ' sepia(90%)';
  } else if (adjustments.filter === 'vivid') {
    filterStr += ' saturate(135%) contrast(110%)';
  } else if (adjustments.filter === 'vintage') {
    filterStr += ' sepia(40%) contrast(90%) brightness(105%)';
  } else if (adjustments.filter === 'dramatic') {
    filterStr += ' contrast(140%) brightness(95%)';
  }

  ctx.filter = filterStr;

  // Draw cropped section
  ctx.drawImage(
    sourceImg,
    sx,
    sy,
    sWidth,
    sHeight,
    -sWidth / 2,
    -sHeight / 2,
    sWidth,
    sHeight
  );

  ctx.restore();

  // If temperature or exposure adjustments are non-zero, apply pixel-level color matrix
  if (adjustments.temperature !== 0 || adjustments.exposure !== 0) {
    applyColorGrading(ctx, canvas.width, canvas.height, adjustments.temperature, adjustments.exposure);
  }
}

/**
 * Pixel manipulation for Warmth (Temperature) and Exposure
 */
function applyColorGrading(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  temp: number,
  exposure: number
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Exposure factor (e.g. exposure +50 -> 1.5 multiplier)
  const expMult = Math.pow(2, exposure / 100);

  // Temperature factor: warm adds red/yellow, cool adds blue
  const warmR = temp > 0 ? (temp * 0.4) : (temp * 0.15);
  const warmB = temp < 0 ? (-temp * 0.4) : (-temp * 0.15);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] * expMult + warmR;
    let g = data[i + 1] * expMult;
    let b = data[i + 2] * expMult + warmB;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Exports Canvas to Blob
 */
export function exportCanvasToBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Export failed'))),
      'image/jpeg',
      quality
    );
  });
}
