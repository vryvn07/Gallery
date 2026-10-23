import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CreatorModal, CREATOR_INFO } from '../components/dialogs/CreatorModal';
import { CreatorSignature } from '../components/layout/CreatorSignature';

describe('Creator & Architect Profile — Aryan Singh', () => {
  it('contains the exact specified creator profile metadata', () => {
    expect(CREATOR_INFO.name).toBe('Aryan Singh');
    expect(CREATOR_INFO.role).toBe('Creator & Lead Platform Architect');
    expect(CREATOR_INFO.tagline).toBe(
      'Software Architect & Platform Engineer | Independent Filmmaker'
    );
    expect(CREATOR_INFO.location).toBe('Gorakhpur, Uttar Pradesh, India');
    expect(CREATOR_INFO.portfolio).toBe(
      'https://aryan-cine-dev-portfolio.vercel.app/'
    );
    expect(CREATOR_INFO.github).toBe(
      'https://github.com/aryansingh0777raghav'
    );
    expect(CREATOR_INFO.linkedin).toBe(
      'https://www.linkedin.com/in/iamaryan07'
    );
    expect(CREATOR_INFO.imdb).toBe('https://www.imdb.com/name/nm18214429/');
    expect(CREATOR_INFO.instagram).toBe(
      'https://www.instagram.com/iam_aryannnn07'
    );
    expect(CREATOR_INFO.email).toBe('aryansingh979211@gmail.com');
    expect(CREATOR_INFO.bio).toContain('Software Architect and Independent Filmmaker');
    expect(CREATOR_INFO.flagships).toEqual([
      'ArKTest Beta',
      'ArCV',
      'CarHari',
      'VnishAr',
      'CineOn Studio 7',
    ]);
    expect(CREATOR_INFO.avatar).toBeDefined();
  });

  it('renders CreatorSignature pill with direct portfolio link, avatar image, and modal trigger', () => {
    const handleOpenModal = vi.fn();
    render(<CreatorSignature onOpenModal={handleOpenModal} />);

    // Check signature text and avatar
    expect(screen.getByText('Aryan Singh')).toBeDefined();
    expect(screen.getByText(/Crafted by/)).toBeDefined();
    const avatarImg = screen.getByAltText('Aryan Singh') as HTMLImageElement;
    expect(avatarImg).toBeDefined();
    expect(avatarImg.src).toContain('aryan-singh');

    // Check portfolio external link
    const link = screen.getByTitle("Open Aryan Singh's Portfolio") as HTMLAnchorElement;
    expect(link.href).toBe('https://aryan-cine-dev-portfolio.vercel.app/');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');

    // Trigger modal callback
    const button = screen.getByTitle('View Creator & Architect Profile');
    fireEvent.click(button);
    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  it('renders CreatorSignature card variant for Settings view', () => {
    const handleOpenModal = vi.fn();
    render(<CreatorSignature variant="card" onOpenModal={handleOpenModal} />);

    expect(screen.getByText('Aryan Singh')).toBeDefined();
    expect(screen.getByText('Creator & Lead Platform Architect')).toBeDefined();

    const portfolioBtn = screen.getByRole('link', { name: /Portfolio/i }) as HTMLAnchorElement;
    expect(portfolioBtn.href).toBe('https://aryan-cine-dev-portfolio.vercel.app/');
    expect(portfolioBtn.target).toBe('_blank');
  });

  it('renders CreatorModal with full profile details, links, and flagships', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <CreatorModal isOpen={false} onClose={handleClose} />
    );

    // When closed, nothing should be in the DOM
    expect(screen.queryByText(/Aryan Singh — Platform Architect & Creator/)).toBeNull();

    // When opened
    rerender(<CreatorModal isOpen={true} onClose={handleClose} />);
    expect(
      screen.getByText('Aryan Singh — Platform Architect & Creator')
    ).toBeDefined();
    expect(screen.getByText(CREATOR_INFO.bio)).toBeDefined();
    expect(screen.getByText('Gorakhpur, Uttar Pradesh, India')).toBeDefined();

    // Check all 5 flagships are rendered
    for (const flagship of CREATOR_INFO.flagships) {
      expect(screen.getByText(flagship)).toBeDefined();
    }

    // Check external links
    const portfolioLinks = screen.getAllByRole('link', { name: /Portfolio/i });
    expect(portfolioLinks.length).toBeGreaterThan(0);

    const githubLinks = screen.getAllByRole('link', { name: /GitHub/i });
    expect(githubLinks.length).toBeGreaterThanOrEqual(1);
    expect((githubLinks[0] as HTMLAnchorElement).href).toBe('https://github.com/aryansingh0777raghav');

    const linkedinLinks = screen.getAllByRole('link', { name: /LinkedIn/i });
    expect(linkedinLinks.length).toBeGreaterThanOrEqual(1);
    expect((linkedinLinks[0] as HTMLAnchorElement).href).toBe('https://www.linkedin.com/in/iamaryan07');

    // Test close button
    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
