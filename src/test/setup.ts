import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock URL.createObjectURL and URL.revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:mock-url';
  URL.revokeObjectURL = () => {};
}

// Mock HTMLCanvasElement getContext & toBlob for jsdom
HTMLCanvasElement.prototype.getContext = function () {
  return {
    drawImage: () => {},
    fillRect: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(400) }),
    putImageData: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
  } as any;
};

HTMLCanvasElement.prototype.toBlob = function (callback: (blob: Blob | null) => void) {
  callback(new Blob(['mock_image_bytes'], { type: 'image/webp' }));
};

// Mock navigator.storage
if (!navigator.storage) {
  (navigator as any).storage = {
    estimate: async () => ({ usage: 1024 * 1024 * 25, quota: 1024 * 1024 * 1024 }),
    persist: async () => true,
    persisted: async () => true,
  };
}
