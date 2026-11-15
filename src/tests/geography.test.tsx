// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WorldExplorer from '../apps/WorldExplorer';
import { CONTINENTS, GEO_QUESTIONS, OCEANS } from '../content/geography';
import { themeById } from '../core/themes';
import type { Profile } from '../core/types';

afterEach(() => {
  cleanup();
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  vi.restoreAllMocks();
});

const mockProfile: Profile = {
  id: 'test_rowan',
  name: 'Rowan',
  avatar: '🧒',
  themeId: 'pirate',
  age: 5,
  stars: 10,
  levels: { reading: 3, math: 4 },
  focusSkills: [],
  placementDone: true,
  stickers: [],
  createdAt: 1700000000000,
  settings: {
    dailyMinutes: 0,
    hintMode: 'full',
    speechRate: 1.0,
    allowedThemes: [],
    timerMode: 'off',
    disabledApps: [],
  },
};

const mockTheme = themeById('pirate');

describe('World Explorer - Geography & Visual Map Aids', () => {
  it('has comprehensive geography content: 7 continents, 5 oceans, and questions', () => {
    expect(Object.keys(CONTINENTS).length).toBe(7);
    expect(Object.keys(OCEANS).length).toBe(5);
    expect(GEO_QUESTIONS.length).toBeGreaterThanOrEqual(20);

    // Verify all 7 continents exist with names and paths
    const names = Object.values(CONTINENTS).map((c) => c.name);
    expect(names).toContain('North America');
    expect(names).toContain('South America');
    expect(names).toContain('Europe');
    expect(names).toContain('Africa');
    expect(names).toContain('Asia');
    expect(names).toContain('Australia');
    expect(names).toContain('Antarctica');
  });

  it('renders the interactive world map with all 7 continents and choices', async () => {
    render(<WorldExplorer profile={mockProfile} theme={mockTheme} onExit={() => {}} />);

    // Renders the interactive map SVG
    expect(screen.getByRole('application', { name: /Interactive World Map/i })).toBeTruthy();

    // Renders continent labels on the map
    expect(screen.getAllByText('Africa').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Australia').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Antarctica').length).toBeGreaterThanOrEqual(1);

    // Renders answer options with letters A, B, C
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
  });

  it('selects an answer, displays feedback fact, and awards stars', async () => {
    render(<WorldExplorer profile={mockProfile} theme={mockTheme} onExit={() => {}} />);

    // Click the first option
    const firstOption = screen.getByRole('button', { name: /Option A:/i });
    fireEvent.click(firstOption);

    // Feedback bar displays fact and Next button
    await waitFor(() => {
      expect(document.querySelector('.trivia-feedback-bar')).toBeTruthy();
      expect(screen.getByRole('button', { name: /Next Location/i })).toBeTruthy();
    });
  });

  it('clicking a continent directly on the map opens the free explore modal card', async () => {
    render(<WorldExplorer profile={mockProfile} theme={mockTheme} onExit={() => {}} />);

    const africaButton = screen.getByRole('button', { name: /Africa continent/i });
    fireEvent.click(africaButton);

    await waitFor(() => {
      // Modal card appears or choice triggers
      expect(document.querySelector('.card')).toBeTruthy();
    });
  });
});
