// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PassportBook from '../apps/PassportBook';
import {
  MASTER_COUNTRIES,
  awardPassportStamp,
  clearPassportStorage,
  getPassportStamps,
  hasPassportStamp,
} from '../core/passport';
import { themeById } from '../core/themes';
import type { Profile } from '../core/types';

vi.mock('../core/speech', () => ({
  speak: vi.fn().mockResolvedValue(undefined),
  stopSpeaking: vi.fn(),
  sfx: {
    star: vi.fn(),
    soft: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  clearPassportStorage();
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  vi.restoreAllMocks();
});

const mockProfile: Profile = {
  id: 'test_explorer',
  name: 'Rowan',
  avatar: '🧑‍🚀',
  themeId: 'space',
  age: 6,
  stars: 25,
  levels: { reading: 3, math: 3 },
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

const mockTheme = themeById('space');

describe('World Explorer Passport System', () => {
  it('has comprehensive master countries defined', () => {
    const countries = Object.values(MASTER_COUNTRIES);
    expect(countries.length).toBeGreaterThanOrEqual(20);

    for (const c of countries) {
      expect(c.country).toBeTruthy();
      expect(c.flagEmoji).toBeTruthy();
      expect(c.continent).toBeTruthy();
      expect(c.landmarkEmoji).toBeTruthy();
      expect(c.funFact.length).toBeGreaterThan(15);
    }
  });

  it('awards stamps and prevents duplicates', () => {
    expect(getPassportStamps(mockProfile.id)).toEqual([]);

    // Award Japan
    const first = awardPassportStamp(mockProfile.id, 'Japan');
    expect(first).toBe(true);
    expect(hasPassportStamp(mockProfile.id, 'Japan')).toBe(true);

    // Duplicate attempt returns false
    const duplicate = awardPassportStamp(mockProfile.id, 'Japan');
    expect(duplicate).toBe(false);

    // Award France
    const second = awardPassportStamp(mockProfile.id, 'France');
    expect(second).toBe(true);

    const stamps = getPassportStamps(mockProfile.id);
    expect(stamps.length).toBe(2);
    expect(stamps[0].country).toBe('France');
    expect(stamps[1].country).toBe('Japan');
  });

  it('renders passport header and stamp grid in PassportBook', () => {
    awardPassportStamp(mockProfile.id, 'Japan');
    awardPassportStamp(mockProfile.id, 'Canada');

    render(<PassportBook profile={mockProfile} theme={mockTheme} onExit={vi.fn()} />);

    // Shows personalized title
    expect(screen.getByText("Rowan's Official Passport")).toBeTruthy();
    expect(screen.getByText(/2 Countries Discovered/i)).toBeTruthy();

    // Shows continent filter tabs
    expect(screen.getByText('🌐 All Stamps')).toBeTruthy();
    expect(screen.getByText('🏰 Europe')).toBeTruthy();
    expect(screen.getByText('🏯 Asia')).toBeTruthy();
  });

  it('inspects an earned stamp and reveals landmark fun fact', () => {
    awardPassportStamp(mockProfile.id, 'Japan');

    render(<PassportBook profile={mockProfile} theme={mockTheme} onExit={vi.fn()} />);

    // Click on Japan stamp
    const stampBtn = screen.getByLabelText('Stamp for Japan: Collected');
    fireEvent.click(stampBtn);

    // Inspect callout should appear
    expect(screen.getByText(/Mount Fuji & Tokyo/i)).toBeTruthy();
  });
});
