/**
 * High-reliability file picker for mobile browsers (Android Chrome, iOS Safari)
 * and desktop browsers.
 */

export function selectLocalFiles(accept = 'image/*,video/*'): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;
    input.style.position = 'fixed';
    input.style.top = '-10000px';
    input.style.left = '-10000px';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';

    document.body.appendChild(input);

    let settled = false;

    const cleanup = () => {
      settled = true;
      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };

    input.onchange = () => {
      if (settled) return;
      const files = input.files ? Array.from(input.files) : [];
      cleanup();
      resolve(files);
    };

    // Modern browsers fire cancel event when user dismisses the file picker without selecting
    input.oncancel = () => {
      if (settled) return;
      cleanup();
      resolve([]);
    };

    // Fallback: If user takes a very long time or switches away, don't prematurely abort.
    // Only resolve empty if window regained focus AND after ample delay still no files were received.
    const handleFocus = () => {
      setTimeout(() => {
        if (!settled && (!input.files || input.files.length === 0)) {
          cleanup();
          resolve([]);
        }
      }, 5000);
    };

    window.addEventListener('focus', handleFocus, { once: true });

    // Trigger file chooser dialog
    input.click();
  });
}
