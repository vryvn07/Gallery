# Gallery — Local-First Progressive Web App

A clean, modern, privacy-first Progressive Web App (PWA) inspired by the experience of **Samsung Gallery**. Designed for mobile browsers (especially Android Chrome) as well as tablet and desktop viewports, **Gallery** lets you browse, organize, view, edit, and manage photos and videos stored locally on your device with **zero cloud dependencies**.

---

## 🌟 Highlights & Key Features

### 1. Timeless Branding & Theme System
- **App Identity**: Named strictly **Gallery** throughout UI, manifest, install prompts, and settings.
- **Default Theme**: Launches in **Light Mode by default** on first use, independent of the operating system's color scheme.
- **Instant Dark Mode Toggle**: Fully functional toggle in Settings featuring Sun and Moon icons. Switches theme instantly without reloading the page.
- **Theme Persistence**: Selection is remembered across page refreshes, PWA restarts, and offline launches using both IndexedDB and local storage.
- **Dynamic Meta Theme-Color**: Synchronizes browser address bar theme color (`#ffffff` for Light Mode, `#0f1117` for Dark Mode).

### 2. Automatic Local Media Sync (File System Access API)
- **Directory Handle Persistence**: Where supported (e.g. Chromium browsers supporting `window.showDirectoryPicker()`), connect local folders (such as `DCIM/Camera`, `Pictures`, `Screenshots`, `Downloads`) once and persist their handles in IndexedDB.
- **Foreground Re-scan**: Automatically checks connected folders on app launch, when returning to the foreground (`visibilitychange`), or on manual refresh.
- **Incremental Indexing & Deduplication**: Compares file size and modification timestamps to avoid re-decoding unchanged files.
- **Non-destructive Inaccessibility Handling**: Missing or disconnected files are marked safely rather than permanently destroyed.
- **File Picker Fallback**: For browsers without Directory Handle access, provides a multi-file picker (`<input type="file" multiple accept="image/*,video/*">`) with clear transparency that it operates in Imported Mode.

### 3. Dual Storage Architecture
- **Referenced Mode**: Indexes files inside connected local folders, storing handles and lightweight thumbnails in IndexedDB while leaving original media files on the device disk. Saves storage and avoids file duplication.
- **Imported Mode**: Stores binary blobs inside browser IndexedDB for standalone offline access without folder handle requirements.
- **Thumbnail Cache Management**: High-speed 300–400px WebP thumbnails are cached for 60fps scrolling. Users can clear the thumbnail cache at any time from Settings without losing any media items or albums.

### 4. Photos Grid
- **Date Grouping**: Groups media chronologically ("Today", "Yesterday", by Month and Year).
- **Date Group Select**: Select entire date sections with a single tap.
- **Configurable Density**: Switch between Compact (5 columns), Comfortable (4 columns), and Expanded (3 columns).
- **Media Badges**: Duration badges for videos (`01:24`), favorite heart icons for starred items.
- **Selection Mode**: Long-press any thumbnail on touch devices or click the select button to enter multi-selection mode with bulk actions: Share, Add to Album, Favorite, and Trash.

### 5. Immersive Media Viewer & Video Player
- **Full-Screen Canvas**: Clean black viewing canvas with tap-to-toggle header and footer controls.
- **Touch Gestures**: Left/right swipe to navigate, double-tap to zoom (1x to 2.5x), and smooth pan dragging when zoomed.
- **Integrated Video Player**: HTML5 video playback with responsive scrubber bar, duration timer, mute toggle, and fullscreen support.
- **Photo Details Sheet (Swipe Up / Info)**: Displays filename, file size, dimensions (megapixels), capture date, and available EXIF camera data (model, aperture, shutter speed, ISO, focal length, GPS coordinates).

### 6. Non-Destructive Photo Editor
- **Transform**: Rotate 90° clockwise/counter-clockwise, flip horizontally and vertically, and crop with preset aspect ratios (Free, 1:1, 4:3, 16:9, 9:16).
- **Adjustments**: Sliders for Brightness, Contrast, Saturation, Temperature (Warmth), and Exposure.
- **Preset Filters**: Vivid, Warm, Cool, Dramatic, Grayscale (Mono), Sepia, and Vintage.
- **Workflow Tools**: Undo, Redo, Reset, and Hold-to-Compare with original image.
- **Save Copy**: Exports high-quality JPEG/PNG canvas blob to Gallery without altering the original photo.

### 7. Albums & Organization
- **Auto Categories**: Automatic classification for All Media, Videos, Screenshots, Camera, Downloads, Favorites, and Recently Added.
- **Custom Albums**: Create, rename, and delete albums. Manage album memberships and custom cover photos. Deleting an album leaves photos intact in the main library.

### 8. Fast Local Search
- **Instant Filtering**: Search by filename, folder name, album name, year, month, or camera model.
- **Filter Chips**: Quick chips for Photos, Videos, Favorites, Screenshots, and Camera items.
- **Search History**: Stores recent queries locally with one-tap rerun and clear history options.

### 9. Recently Deleted (Trash)
- **Honest Semantics**: Clear distinction between deleting imported blobs from app storage and removing indexed references to external folder files.
- **Restore & Empty**: Restore accidentally deleted items or permanently empty trash.

### 10. Privacy, Storage & PWA Diagnostics
- **100% Offline & Private**: Zero backend, zero account logins, zero cloud uploads, and zero tracking pixels.
- **Storage Diagnostics**: Live estimation of browser storage quota and percentage used via `navigator.storage.estimate()`.
- **Capability Checklist**: Real-time status indicators for File System Access API, Storage Persistence, Web Share API, and Service Worker.

---

## 📱 How to Install on Android

1. Open Chrome or any Chromium-based Android browser.
2. Navigate to the Gallery PWA URL (e.g. `http://<your-ip>:5173` or deployed HTTPS URL).
3. Tap the browser menu (**⋮**) in the top-right corner.
4. Select **Add to Home screen** or **Install app**.
5. Once installed, tap the **Gallery** icon on your home screen or app drawer. It will launch as a standalone, edge-to-edge application with no browser URL bar.

---

## 💻 Development & Commands

### Prerequisites
- Node.js 18+ (tested on Node v22.16)
- npm 9+

### Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit and integration tests (Vitest)
npm test

# Build production bundle with Service Worker and PWA manifest
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Browser Capabilities & Honest Limitations

| Feature | Supported Browsers | Fallback / Limitation |
| :--- | :--- | :--- |
| **Folder Selection & Auto-Sync** | Desktop Chrome, Edge, Opera (`showDirectoryPicker`) | Android Chrome restricts direct folder handles on certain storage volumes; the app provides a smooth **Import Files** fallback. |
| **Media Sharing** | Android Chrome, Safari, Edge (`navigator.share`) | Directly downloads the media file if Web Share is unsupported. |
| **Offline App Shell** | All modern browsers (Service Worker via Workbox) | Pre-caches app shell, icons, CSS, and JS. Does not cache device media indiscriminately. |
| **Persistent Storage** | Chromium & Firefox (`navigator.storage.persist`) | Browser may evict unpersisted data if device disk is critically full; users can request persistent storage in Settings. |

---

## 🛠 Tech Stack
- **Framework**: React 19 + TypeScript (Strict Mode)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS + Mobile Safe Area utilities
- **Database**: Dexie.js (IndexedDB) + `fake-indexeddb` for tests
- **PWA**: `vite-plugin-pwa` with custom Workbox service worker
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Image Processing**: HTML5 Canvas API + `exifr` for EXIF metadata parsing
- **Testing**: Vitest + React Testing Library + jsdom
