/**
 * Generates lightweight, high-performance thumbnail blobs for smooth grid rendering.
 */

export interface ThumbnailResult {
  thumbnailBlob: Blob;
  width: number;
  height: number;
  duration?: number;
}

const MAX_THUMB_SIZE = 400;

export async function generateImageThumbnail(fileOrBlob: Blob): Promise<ThumbnailResult> {
  const url = URL.createObjectURL(fileOrBlob);

  try {
    const img = new Image();
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), 250);
      img.onload = () => {
        clearTimeout(t);
        resolve();
      };
      img.onerror = () => {
        clearTimeout(t);
        resolve();
      };
      img.src = url;
    });

    const origWidth = img.naturalWidth || 800;
    const origHeight = img.naturalHeight || 600;

    let thumbWidth = origWidth;
    let thumbHeight = origHeight;

    if (origWidth > origHeight) {
      if (origWidth > MAX_THUMB_SIZE) {
        thumbHeight = Math.round((origHeight * MAX_THUMB_SIZE) / origWidth);
        thumbWidth = MAX_THUMB_SIZE;
      }
    } else {
      if (origHeight > MAX_THUMB_SIZE) {
        thumbWidth = Math.round((origWidth * MAX_THUMB_SIZE) / origHeight);
        thumbHeight = MAX_THUMB_SIZE;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, thumbWidth);
    canvas.height = Math.max(1, thumbHeight);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
    }

    const thumbnailBlob = await new Promise<Blob>((resolve) => {
      if (!canvas.toBlob) {
        resolve(new Blob(['thumb'], { type: 'image/webp' }));
        return;
      }
      canvas.toBlob(
        (b) => resolve(b || new Blob(['thumb'], { type: 'image/webp' })),
        'image/webp',
        0.82
      );
    });

    return {
      thumbnailBlob,
      width: origWidth,
      height: origHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function generateVideoThumbnail(fileOrBlob: Blob): Promise<ThumbnailResult> {
  const url = URL.createObjectURL(fileOrBlob);

  return new Promise<ThumbnailResult>((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const timeout = setTimeout(() => {
      cleanup();
      // Provide fallback generic thumbnail on timeout
      createFallbackVideoThumbnail()
        .then((fb) => resolve({ thumbnailBlob: fb, width: 640, height: 360, duration: 0 }))
        .catch(reject);
    }, 4500);

    const cleanup = () => {
      clearTimeout(timeout);
      video.pause();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      // Seek to 1 second or halfway into short video
      const targetTime = Math.min(1.0, (video.duration || 1) / 2);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const origWidth = video.videoWidth || 640;
        const origHeight = video.videoHeight || 360;
        const duration = Math.round(video.duration || 0);

        let thumbWidth = origWidth;
        let thumbHeight = origHeight;

        if (origWidth > origHeight) {
          if (origWidth > MAX_THUMB_SIZE) {
            thumbHeight = Math.round((origHeight * MAX_THUMB_SIZE) / origWidth);
            thumbWidth = MAX_THUMB_SIZE;
          }
        } else {
          if (origHeight > MAX_THUMB_SIZE) {
            thumbWidth = Math.round((origWidth * MAX_THUMB_SIZE) / origHeight);
            thumbHeight = MAX_THUMB_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, thumbWidth);
        canvas.height = Math.max(1, thumbHeight);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve({
                thumbnailBlob: blob,
                width: origWidth,
                height: origHeight,
                duration,
              });
            } else {
              createFallbackVideoThumbnail().then((fb) =>
                resolve({ thumbnailBlob: fb, width: origWidth, height: origHeight, duration })
              );
            }
          },
          'image/webp',
          0.8
        );
      } catch (err) {
        cleanup();
        createFallbackVideoThumbnail()
          .then((fb) => resolve({ thumbnailBlob: fb, width: 640, height: 360, duration: 0 }))
          .catch(reject);
      }
    };

    video.onerror = () => {
      cleanup();
      createFallbackVideoThumbnail()
        .then((fb) => resolve({ thumbnailBlob: fb, width: 640, height: 360, duration: 0 }))
        .catch(reject);
    };
  });
}

async function createFallbackVideoThumbnail(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 320, 180);
    // Draw simple play triangle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(140, 70);
    ctx.lineTo(190, 90);
    ctx.lineTo(140, 110);
    ctx.closePath();
    ctx.fill();
  }
  return new Promise((res) => {
    canvas.toBlob((b) => res(b || new Blob()), 'image/webp', 0.8);
  });
}
