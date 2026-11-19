// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FlagCapitalTrivia from '../apps/FlagCapitalTrivia';
import { FLAG_CAPITAL_LIBRARY } from '../content/flagsCapitals';
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

vi.mock('../core/engine', () => ({
  awardStars: vi.fn(),
  shuffleArray: <T,>(arr: readonly T[]): T[] => [...arr],
}));

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
  id: 'test_player',
  name: 'Sammy',
  avatar: '🧒',
  themeId: 'space',
  age: 7,
  stars: 12,
  levels: { reading: 4, math: 4 },
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

describe('World Flags, Capitals & Monuments Content Library', () => {
  it('has comprehensive content with flags, capitals, and monuments', () => {
    expect(FLAG_CAPITAL_LIBRARY.length).toBeGreaterThanOrEqual(30);

    const categories = new Set(FLAG_CAPITAL_LIBRARY.map((item) => item.category));
    expect(categories.has('flags')).toBe(true);
    expect(categories.has('capitals')).toBe(true);
    expect(categories.has('monuments')).toBe(true);

    // Verify all items have valid choices, exactly 1 correct answer, and an educational funFact
    for (const item of FLAG_CAPITAL_LIBRARY) {
      expect(item.id).toBeTruthy();
      expect(item.question.length).toBeGreaterThan(10);
      expect(item.flagEmoji).toBeTruthy();
      expect(item.funFact.length).toBeGreaterThan(15);
      expect(item.choices.length).toBe(4);
      const correctChoices = item.choices.filter((c) => c.correct);
      expect(correctChoices.length).toBe(1);
    }
  });

  it('covers major world continents', () => {
    const continents = new Set(FLAG_CAPITAL_LIBRARY.map((item) => item.continent));
    expect(continents.has('North America')).toBe(true);
    expect(continents.has('South America')).toBe(true);
    expect(continents.has('Europe')).toBe(true);
    expect(continents.has('Asia')).toBe(true);
    expect(continents.has('Africa')).toBe(true);
    expect(continents.has('Oceania')).toBe(true);
  });
});

describe('FlagCapitalTrivia Component', () => {
  it('renders mode selection with Solo and 2-Player options', () => {
    render(
      <FlagCapitalTrivia
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    expect(screen.getByText('World Flags & Capitals Quest')).toBeTruthy();
    expect(screen.getByText(/Solo Explorer/i)).toBeTruthy();
    expect(screen.getByText(/2-Player World Challenge/i)).toBeTruthy();
  });

  it('starts solo game and renders first question with choices and hear button', () => {
    render(
      <FlagCapitalTrivia
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    // Select Solo Explorer
    fireEvent.click(screen.getByText(/Solo Explorer/i));

    // In player setup, click Start Journey
    const startBtn = screen.getByText(/Start Journey!/i);
    fireEvent.click(startBtn);

    // Question screen should now be visible
    expect(screen.getByText(/Tap to Hear/i)).toBeTruthy();
    expect(screen.getByText(/Done 🏁/i)).toBeTruthy();

    // There should be 4 options (A, B, C, D)
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
    expect(screen.getByText('D')).toBeTruthy();
  });

  it('answers a question and reveals the fun fact and Next button', () => {
    render(
      <FlagCapitalTrivia
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Solo Explorer/i));
    fireEvent.click(screen.getByText(/Start Journey!/i));

    // Click choice A
    const optionA = screen.getByLabelText(/Option A:/i);
    fireEvent.click(optionA);

    // Feedback bar should appear with Next button
    expect(screen.getByText(/Next ➡️/i)).toBeTruthy();
  });

  it('guarantees questions DO NOT repeat in the active session', () => {
    const { unmount } = render(
      <FlagCapitalTrivia
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Solo Explorer/i));
    fireEvent.click(screen.getByText(/Start Journey!/i));

    const seenQuestionTexts = new Set<string>();

    // Advance through 10 questions and ensure every question is distinct
    for (let i = 0; i < 10; i++) {
      const questionEl = document.querySelector('.trivia-question');
      expect(questionEl).toBeTruthy();
      const text = questionEl!.textContent!;

      expect(seenQuestionTexts.has(text)).toBe(false);
      seenQuestionTexts.add(text);

      // Answer option A and advance
      const optA = screen.getByLabelText(/Option A:/i);
      fireEvent.click(optA);

      const nextBtn = screen.getByText(/Next ➡️/i);
      fireEvent.click(nextBtn);
    }

    expect(seenQuestionTexts.size).toBe(10);
    unmount();
  });

  it('hides flags in options by default and reveals them only when hint is requested', () => {
    const { unmount } = render(
      <FlagCapitalTrivia
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Solo Explorer/i));
    fireEvent.click(screen.getByText(/Start Journey!/i));

    // Initially, before asking for a hint, the flag-choice-emoji elements should NOT be visible
    expect(document.querySelectorAll('.flag-choice-emoji').length).toBe(0);

    // Click the hint button
    const hintBtn = screen.getByRole('button', { name: /Show flag hints for choices/i });
    expect(hintBtn).toBeTruthy();
    fireEvent.click(hintBtn);

    // Flags in options are now revealed!
    expect(document.querySelectorAll('.flag-choice-emoji').length).toBeGreaterThanOrEqual(1);

    unmount();
  });
});
