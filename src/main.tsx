import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { GalleryProvider } from './context/GalleryContext';
import { GalleryAppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <GalleryProvider>
        <GalleryAppContent />
      </GalleryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
