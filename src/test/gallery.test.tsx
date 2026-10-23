import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { GalleryProvider, useGallery } from '../context/GalleryContext';
import { ThemeProvider } from '../context/ThemeContext';
import { db, initializeDatabase } from '../services/storage/database';

const GalleryIntegrationHarness = () => {
  const {
    mediaList,
    albums,
    createAlbum,
    activeTab,
    setActiveTab,
    toggleFavorite,
    moveToTrash,
    restoreFromTrash,
    trashedList,
  } = useGallery();

  return (
    <div>
      <div data-testid="active-tab">{activeTab}</div>
      <div data-testid="media-count">{mediaList.length}</div>
      <div data-testid="albums-count">{albums.length}</div>
      <div data-testid="trashed-count">{trashedList.length}</div>

      <button onClick={() => setActiveTab('albums')}>Go Albums</button>
      <button onClick={() => setActiveTab('search')}>Go Search</button>
      <button onClick={() => setActiveTab('settings')}>Go Settings</button>
      <button onClick={() => createAlbum('Vacation 2026')}>Create Vacation Album</button>

      {mediaList.length > 0 && (
        <>
          <button onClick={() => toggleFavorite(mediaList[0].id)}>Toggle First Favorite</button>
          <button onClick={() => moveToTrash([mediaList[0].id])}>Trash First</button>
        </>
      )}

      {trashedList.length > 0 && (
        <button onClick={() => restoreFromTrash([trashedList[0].id])}>Restore First Trashed</button>
      )}
    </div>
  );
};

describe('Gallery Integration & User Flows', () => {
  beforeEach(async () => {
    await db.media.clear();
    await db.albums.clear();
    await db.albumMedia.clear();
    await db.settings.clear();
    await initializeDatabase();
  });

  it('renders default gallery state and transitions navigation tabs', async () => {
    render(
      <ThemeProvider>
        <GalleryProvider>
          <GalleryIntegrationHarness />
        </GalleryProvider>
      </ThemeProvider>
    );

    expect(screen.getByTestId('active-tab').textContent).toBe('photos');

    // Switch to Albums
    await act(async () => {
      screen.getByText('Go Albums').click();
    });
    expect(screen.getByTestId('active-tab').textContent).toBe('albums');

    // Switch to Search
    await act(async () => {
      screen.getByText('Go Search').click();
    });
    expect(screen.getByTestId('active-tab').textContent).toBe('search');

    // Switch to Settings
    await act(async () => {
      screen.getByText('Go Settings').click();
    });
    expect(screen.getByTestId('active-tab').textContent).toBe('settings');
  });

  it('supports creating custom albums and updating album list', async () => {
    render(
      <ThemeProvider>
        <GalleryProvider>
          <GalleryIntegrationHarness />
        </GalleryProvider>
      </ThemeProvider>
    );

    // Initial system albums (7 albums)
    const initialAlbumCount = await db.albums.count();
    expect(initialAlbumCount).toBe(7);

    // Create user album
    await act(async () => {
      screen.getByText('Create Vacation Album').click();
    });

    const userAlbum = await db.albums.where('title').equals('Vacation 2026').first();
    expect(userAlbum).toBeDefined();
    expect(userAlbum?.isSystem).toBe(false);
  });
});
