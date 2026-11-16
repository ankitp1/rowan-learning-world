// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GeoDetective from '../apps/GeoDetective';
import { DETECTIVE_CASES } from '../content/geoDetective';
import { themeById } from '../core/themes';
import type { Profile } from '../core/types';

vi.mock('../core/speech', () => ({
  speak: vi.fn().mockResolvedValue(undefined),
  speakThemePraise: vi.fn().mockResolvedValue(undefined),
  speakThemeEncouragement: vi.fn().mockResolvedValue(undefined),
  stopSpeaking: vi.fn(),
  sfx: {
    star: vi.fn(),
    soft: vi.fn(),
    chest: vi.fn(),
  },
}));

const mockAwardStars = vi.fn();
vi.mock('../core/engine', () => ({
  awardStars: (...args: any[]) => mockAwardStars(...args),
}));

const mockAwardPassportStamp = vi.fn().mockReturnValue(true);
vi.mock('../core/passport', () => ({
  awardPassportStamp: (...args: any[]) => mockAwardPassportStamp(...args),
  getPassportStamps: vi.fn().mockReturnValue([]),
  hasPassportStamp: vi.fn().mockReturnValue(false),
}));

afterEach(() => {
  cleanup();
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  vi.restoreAllMocks();
  mockAwardStars.mockClear();
  mockAwardPassportStamp.mockClear();
});

const mockProfile: Profile = {
  id: 'detective_rowan',
  name: 'Rowan',
  avatar: '🧒',
  themeId: 'detective',
  age: 6,
  stars: 10,
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

const mockTheme = themeById('pirate');

describe('Where in the World? (Geography Detective) Content Library', () => {
  it('contains at least 12 detailed world mystery cases', () => {
    expect(DETECTIVE_CASES.length).toBeGreaterThanOrEqual(12);

    for (const c of DETECTIVE_CASES) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.suspect.name).toBeTruthy();
      expect(c.suspect.avatar).toBeTruthy();
      expect(c.suspect.title).toBeTruthy();
      expect(c.targetCity).toBeTruthy();
      expect(c.targetCountry).toBeTruthy();
      expect(c.targetContinent).toBeTruthy();
      expect(c.flagEmoji).toBeTruthy();
      expect(c.landmarkEmoji).toBeTruthy();
      expect(c.funFact.length).toBeGreaterThan(15);

      // Verify exactly 3 progressive clues
      expect(c.clues.length).toBe(3);
      for (const clue of c.clues) {
        expect(clue.icon).toBeTruthy();
        expect(clue.text.length).toBeGreaterThan(10);
      }

      // Verify exactly 4 choices with 1 correct
      expect(c.choices.length).toBe(4);
      const correctList = c.choices.filter((choice) => choice.correct);
      expect(correctList.length).toBe(1);
      expect(correctList[0].city).toBe(c.targetCity);
    }
  });

  it('covers all major inhabited world continents', () => {
    const continents = new Set(DETECTIVE_CASES.map((c) => c.targetContinent));
    expect(continents.has('Europe')).toBe(true);
    expect(continents.has('Asia')).toBe(true);
    expect(continents.has('Africa')).toBe(true);
    expect(continents.has('North America')).toBe(true);
    expect(continents.has('South America')).toBe(true);
    expect(continents.has('Oceania')).toBe(true);
  });
});

describe('GeoDetective Component Interaction & Clue Progression', () => {
  it('renders initial dossier with suspect card, Clue 1 revealed, and Clue 2 & 3 locked', () => {
    render(
      <GeoDetective
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    // Header & suspect info
    expect(screen.getByText(/WANTED SUSPECT/i)).toBeTruthy();
    expect(screen.getByText(/Read Clues/i)).toBeTruthy();
    expect(screen.getByText(/1 of 3 Clues Discovered/i)).toBeTruthy();

    // Clue 1 should be unlocked, Clue 2 & 3 locked
    expect(screen.getByText(/🔍 Clue #1/i)).toBeTruthy();
    expect(screen.getByText(/🔒 Clue #2/i)).toBeTruthy();
    expect(screen.getByText(/🔒 Clue #3/i)).toBeTruthy();

    // Next Clue button should be visible
    expect(screen.getByText(/Next Clue \(2\/3\)/i)).toBeTruthy();

    // 4 destination choices should be visible
    const optionButtons = screen.getAllByRole('button', { name: /Option [A-D]:/i });
    expect(optionButtons.length).toBe(4);
  });

  it('progressively unlocks Clue 2 and Clue 3 when Next Clue is clicked', () => {
    render(
      <GeoDetective
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    // Tap Next Clue to reveal Clue 2
    const nextClueBtn1 = screen.getByText(/Next Clue \(2\/3\)/i);
    fireEvent.click(nextClueBtn1);

    expect(screen.getByText(/2 of 3 Clues Discovered/i)).toBeTruthy();
    expect(screen.getByText(/🔍 Clue #2/i)).toBeTruthy();
    expect(screen.getByText(/🔒 Clue #3/i)).toBeTruthy();

    // Tap Next Clue to reveal Clue 3
    const nextClueBtn2 = screen.getByText(/Next Clue \(3\/3\)/i);
    fireEvent.click(nextClueBtn2);

    expect(screen.getByText(/3 of 3 Clues Discovered/i)).toBeTruthy();
    expect(screen.getByText(/🔍 Clue #3/i)).toBeTruthy();
    expect(screen.getByText(/All clues unlocked!/i)).toBeTruthy();
  });

  it('handles correct city selection: awards 2 stars and a passport stamp', () => {
    render(
      <GeoDetective
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    // Find the correct button by finding the choice that matches target
    const optionButtons = screen.getAllByRole('button', { name: /Option [A-D]:/i });
    
    // We can inspect the displayed case by querying the title
    const caseTitleElement = document.querySelector('.case-title-text');
    const caseTitle = caseTitleElement?.textContent;
    const currentCaseDef = DETECTIVE_CASES.find((c) => c.title === caseTitle)!;
    expect(currentCaseDef).toBeDefined();

    // Find the button with the target city
    const correctBtn = optionButtons.find((btn) =>
      btn.textContent?.includes(currentCaseDef.targetCity)
    )!;
    expect(correctBtn).toBeDefined();

    fireEvent.click(correctBtn);

    // Verify celebratory feedback
    expect(screen.getByText(/Suspect Caught!/i)).toBeTruthy();
    expect(screen.getByText(/Next Case 🔍/i)).toBeTruthy();

    // Verify 2 stars awarded
    expect(mockAwardStars).toHaveBeenCalledWith('detective_rowan', 2);

    // Verify passport stamp awarded
    expect(mockAwardPassportStamp).toHaveBeenCalledWith(
      'detective_rowan',
      currentCaseDef.targetCountry,
      currentCaseDef.flagEmoji,
      currentCaseDef.targetContinent,
      currentCaseDef.landmarkEmoji,
      `${currentCaseDef.targetCity} Landmark`,
      'Geography Detective',
      currentCaseDef.funFact
    );
  });

  it('handles incorrect city selection: reveals correct location and provides gentle encouragement', () => {
    render(
      <GeoDetective
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    const caseTitleElement = document.querySelector('.case-title-text');
    const caseTitle = caseTitleElement?.textContent;
    const currentCaseDef = DETECTIVE_CASES.find((c) => c.title === caseTitle)!;

    const optionButtons = screen.getAllByRole('button', { name: /Option [A-D]:/i });
    // Pick an incorrect option
    const wrongBtn = optionButtons.find(
      (btn) => !btn.textContent?.includes(currentCaseDef.targetCity)
    )!;
    expect(wrongBtn).toBeDefined();

    fireEvent.click(wrongBtn);

    // Verify feedback for escaped suspect
    expect(screen.getByText(/Suspect Slipped Away!/i)).toBeTruthy();
    expect(screen.getByText(/Next Case 🔍/i)).toBeTruthy();

    // No stars should be awarded on a wrong guess
    expect(mockAwardStars).not.toHaveBeenCalled();
  });

  it('supports Read Clues button for audio accessibility', async () => {
    const { speak } = vi.mocked(await import('../core/speech'));
    render(
      <GeoDetective
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    const hearBtn = screen.getByRole('button', { name: /Read clues aloud/i });
    fireEvent.click(hearBtn);

    expect(speak).toHaveBeenCalled();
  });
});

describe('GeoDetective Session Non-Repeat Logic', () => {
  it('guarantees cases do NOT repeat across rounds until library is exhausted', () => {
    const { unmount } = render(
      <GeoDetective
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    const askedCaseIds = new Set<string>();

    for (let round = 0; round < DETECTIVE_CASES.length; round++) {
      const caseTitleElement = document.querySelector('.case-title-text');
      const caseTitle = caseTitleElement?.textContent;
      const caseDef = DETECTIVE_CASES.find((c) => c.title === caseTitle)!;
      expect(caseDef).toBeDefined();

      // Ensure this case was NOT previously asked in this session
      expect(askedCaseIds.has(caseDef.id)).toBe(false);
      askedCaseIds.add(caseDef.id);

      // Answer and click Next Case
      const optionButtons = screen.getAllByRole('button', { name: /Option [A-D]:/i });
      fireEvent.click(optionButtons[0]);

      const nextCaseBtn = screen.getByText(/Next Case 🔍/i);
      fireEvent.click(nextCaseBtn);
    }

    // All unique cases were served without any repeats
    expect(askedCaseIds.size).toBe(DETECTIVE_CASES.length);

    unmount();
  });
});
