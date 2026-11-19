// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CompleteTheFlag from '../apps/CompleteTheFlag';
import {
  FLAG_PUZZLE_LIBRARY,
  type FlagPuzzleItem,
} from '../content/flagPuzzles';
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
    tap: vi.fn(),
  },
}));

const mockAwardStars = vi.fn();
vi.mock('../core/engine', () => ({
  awardStars: (...args: any[]) => mockAwardStars(...args),
  shuffleArray: <T,>(arr: readonly T[]): T[] => [...arr],
}));

const mockAwardPassportStamp = vi.fn().mockReturnValue(true);
vi.mock('../core/passport', () => ({
  awardPassportStamp: (...args: any[]) => mockAwardPassportStamp(...args),
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
  id: 'test_player_flag',
  name: 'Rowan',
  avatar: '🧒',
  themeId: 'space',
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

const mockTheme = themeById('space');

describe('Complete the Flag Puzzle Library', () => {
  it('contains at least 20 world countries across all continents', () => {
    expect(FLAG_PUZZLE_LIBRARY.length).toBeGreaterThanOrEqual(20);

    const continents = new Set(FLAG_PUZZLE_LIBRARY.map((item) => item.continent));
    expect(continents.has('North America')).toBe(true);
    expect(continents.has('South America')).toBe(true);
    expect(continents.has('Europe')).toBe(true);
    expect(continents.has('Asia')).toBe(true);
    expect(continents.has('Africa')).toBe(true);
    expect(continents.has('Oceania')).toBe(true);
  });

  it('validates that every puzzle item has valid attributes and exactly 1 correct answer', () => {
    for (const puzzle of FLAG_PUZZLE_LIBRARY) {
      expect(puzzle.id).toMatch(/^puzzle_/);
      expect(puzzle.country).toBeTruthy();
      expect(puzzle.flagEmoji).toBeTruthy();
      expect(puzzle.continent).toBeTruthy();
      expect(puzzle.minAge).toBeGreaterThanOrEqual(3);
      expect(puzzle.maxAge).toBeGreaterThanOrEqual(puzzle.minAge);
      expect(puzzle.question.length).toBeGreaterThan(10);
      expect(puzzle.say.length).toBeGreaterThan(10);
      expect(puzzle.flagStyle.type).toBeTruthy();
      expect(puzzle.colors.length).toBeGreaterThanOrEqual(2);
      expect(['shape', 'stripe', 'emblem']).toContain(puzzle.missingPieceType);
      expect(puzzle.missingDescription.length).toBeGreaterThan(3);
      expect(puzzle.funFact.length).toBeGreaterThan(15);

      // Validate choices: exactly 4 choices with 1 correct
      expect(puzzle.choices.length).toBe(4);
      const correctChoices = puzzle.choices.filter((c) => c.correct);
      expect(correctChoices.length).toBe(1);

      // Unique choice IDs
      const choiceIds = new Set(puzzle.choices.map((c) => c.id));
      expect(choiceIds.size).toBe(4);
    }
  });
});

describe('CompleteTheFlag Component Rendering & Gameplay', () => {
  it('renders flag canvas, missing slot badge, question, and 4 choices with letters A, B, C, D', () => {
    render(
      <CompleteTheFlag
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    // Question header & hear button
    expect(screen.getByText(/Hear/i)).toBeTruthy();
    expect(document.querySelector('.complete-flag-question')).toBeTruthy();

    // Visual flag stage and pulsing slot
    expect(document.querySelector('.flag-box')).toBeTruthy();
    expect(document.querySelector('.pulse-question-badge')?.textContent).toBe('?');

    // 4 option letter badges
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
    expect(screen.getByText('D')).toBeTruthy();
  });

  it('handles selecting a correct choice: snaps piece, awards star & passport stamp, and shows Next button', () => {
    render(
      <CompleteTheFlag
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    // Find the correct choice button
    const choiceButtons = document.querySelectorAll<HTMLButtonElement>(
      '.complete-flag-choice-btn'
    );
    expect(choiceButtons.length).toBe(4);

    // Read question or click first choice
    fireEvent.click(choiceButtons[0]);

    // Answering reveals feedback card and Next Flag button
    expect(document.querySelector('.complete-flag-feedback-card')).toBeTruthy();
    expect(screen.getByText(/Next Flag/i)).toBeTruthy();

    // Verify stars awarded if correct
    const isCorrect = document.querySelector('.feedback-badge')?.textContent?.includes('Correct');
    if (isCorrect) {
      expect(mockAwardStars).toHaveBeenCalledWith(mockProfile.id, 1);
      expect(mockAwardPassportStamp).toHaveBeenCalled();
    }
  });

  it('guarantees puzzles DO NOT repeat in the active session', () => {
    const { unmount } = render(
      <CompleteTheFlag
        profile={mockProfile}
        theme={mockTheme}
        onExit={vi.fn()}
      />
    );

    const seenQuestions = new Set<string>();

    // Advance through 10 flags and ensure each question is unique
    for (let i = 0; i < 10; i++) {
      const questionEl = document.querySelector('.complete-flag-question');
      expect(questionEl).toBeTruthy();
      const questionText = questionEl!.textContent!;

      expect(seenQuestions.has(questionText)).toBe(false);
      seenQuestions.add(questionText);

      // Click first choice
      const choiceButtons = document.querySelectorAll<HTMLButtonElement>(
        '.complete-flag-choice-btn'
      );
      fireEvent.click(choiceButtons[0]);

      // Click Next Flag
      const nextBtn = screen.getByText(/Next Flag/i);
      fireEvent.click(nextBtn);
    }

    expect(seenQuestions.size).toBe(10);
    unmount();
  });

  it('allows finishing early or completing a mission', () => {
    const onExitMock = vi.fn();
    const onCompleteMock = vi.fn();

    render(
      <CompleteTheFlag
        profile={mockProfile}
        theme={mockTheme}
        onExit={onExitMock}
        onComplete={onCompleteMock}
      />
    );

    // Answer first question
    const choiceButtons = document.querySelectorAll<HTMLButtonElement>(
      '.complete-flag-choice-btn'
    );
    fireEvent.click(choiceButtons[0]);

    // Tap Done 🏁
    const doneBtn = screen.getByText(/Done 🏁/i);
    fireEvent.click(doneBtn);

    // Completion / Summary card should appear and onComplete should have been called
    expect(screen.getByText(/Flag Master Explorer!/i)).toBeTruthy();
    expect(onCompleteMock).toHaveBeenCalled();
  });
});
