import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/storage/database';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Strict requirement: Default to 'light' mode on first use, regardless of device system theme
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('gallery_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'light'; // Always light by default
  });

  const applyThemeToDOM = (activeTheme: Theme) => {
    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update browser theme-color metadata
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#0f1117' : '#ffffff');
    }
  };

  useEffect(() => {
    // Apply initial theme immediately to DOM to ensure zero flash
    applyThemeToDOM(theme);

    // Initial sync from Dexie DB if available
    db.settings.get('theme').then((record) => {
      if (record && (record.value === 'light' || record.value === 'dark')) {
        setThemeState(record.value);
        applyThemeToDOM(record.value);
      } else {
        // Ensure default 'light' is in DB
        db.settings.put({ key: 'theme', value: 'light' });
        applyThemeToDOM('light');
      }
    }).catch(() => {
      applyThemeToDOM(theme);
    });
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);

    try {
      localStorage.setItem('gallery_theme', newTheme);
    } catch (e) {
      // ignore
    }

    // Persist in IndexedDB settings store
    db.settings.put({ key: 'theme', value: newTheme }).catch((err) => {
      console.warn('Could not persist theme to IndexedDB:', err);
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
