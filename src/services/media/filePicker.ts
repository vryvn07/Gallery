/**
 * Fallback file picker for browsers without directory picker support
 * or for direct manual media import.
 */

export function selectLocalFiles(accept = 'image/*,video/*'): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;

    let resolved = false;

    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        resolved = true;
        resolve(Array.from(input.files));
      } else {
        resolved = true;
        resolve([]);
      }
    };

    // Handle cancelation or window focus
    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => {
          if (!resolved) {
            resolve([]);
          }
        }, 1000);
      },
      { once: true }
    );

    input.click();
  });
}
