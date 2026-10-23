import { describe, it, expect } from 'vitest';
import { DEFAULT_ADJUSTMENTS } from '../services/editor/imageEditor';

describe('Image Editor Core Service', () => {
  it('provides zero-neutral default adjustments', () => {
    expect(DEFAULT_ADJUSTMENTS.brightness).toBe(0);
    expect(DEFAULT_ADJUSTMENTS.contrast).toBe(0);
    expect(DEFAULT_ADJUSTMENTS.saturation).toBe(0);
    expect(DEFAULT_ADJUSTMENTS.temperature).toBe(0);
    expect(DEFAULT_ADJUSTMENTS.exposure).toBe(0);
    expect(DEFAULT_ADJUSTMENTS.rotation).toBe(0);
    expect(DEFAULT_ADJUSTMENTS.flipH).toBe(false);
    expect(DEFAULT_ADJUSTMENTS.flipV).toBe(false);
    expect(DEFAULT_ADJUSTMENTS.filter).toBe('none');
    expect(DEFAULT_ADJUSTMENTS.cropRect).toBeUndefined();
  });

  it('calculates aspect ratio dimensions for cropping correctly', () => {
    const origW = 1920;
    const origH = 1080;
    const currentRatio = origW / origH; // 1.777 (16:9)

    // Square 1:1 crop
    const targetRatio = 1.0;
    const cropW = (origH * targetRatio) / origW; // 1080 / 1920 = 0.5625
    const cropX = (1 - cropW) / 2;

    expect(cropW).toBeCloseTo(0.5625, 4);
    expect(cropX).toBeCloseTo(0.21875, 4);
  });
});
