// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TicTacToe, { analyzeLoss } from '../apps/TicTacToe';
import WonderTrivia from '../apps/WonderTrivia';
import { WONDER_TRIVIA_LIBRARY } from '../content/wonderTrivia';
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
  themeId: 'space-ranger',
  age: 5,
  stars: 10,
  levels: { reading: 3, math: 4 },
  focusSkills: [],
  placementDone: true,
  stickers: [],
  settings: {
    dailyMinutes: 0,
    hintMode: 'full',
    speechRate: 1.0,
    allowedThemes: [],
    disabledApps: [],
  },
  createdAt: Date.now(),
};

const mockTheme = themeById('space-ranger');

describe('TicTacToe - TV Navigation and Focus Retention', () => {
  it('renders a 3x3 grid where cells remain focusable (never disabled) so the TV cursor stays on previous move', async () => {
    render(<TicTacToe profile={mockProfile} theme={mockTheme} onExit={() => {}} />);

    // Click "Play vs Helper"
    const playVsBtn = screen.getByRole('button', { name: /Play vs/i });
    fireEvent.click(playVsBtn);

    // Verify 9 grid buttons
    const cells = screen.getAllByRole('button', { name: /Square \d/i });
    expect(cells).toHaveLength(9);

    // Center cell (index 4) should have data-autofocus for TV entry
    expect(cells[4].getAttribute('data-autofocus')).not.toBeNull();

    // Click cell 4
    fireEvent.click(cells[4]);

    // Cell 4 must NOT be disabled (HTML disabled removes focus and bounces cursor to Back button!)
    expect((cells[4] as HTMLButtonElement).disabled).toBe(false);
    expect(cells[4].getAttribute('aria-disabled')).toBe('true');
    expect(cells[4].className).toContain('filled');
  });

  it('provides supportive coaching tips explaining what to do differently when a game is lost', () => {
    // 1. Defensive block scenario: O won top row [0, 1, 2], X had pieces not in a winning line
    const lossBoard = ['O', 'O', 'O', 'X', null, null, null, 'X', null] as ('X' | 'O' | null)[];
    const coachDefensive = analyzeLoss(lossBoard, 'O', 'Rowan');
    expect(coachDefensive.tipTitle).toContain('Defense Tip');
    expect(coachDefensive.tipText).toContain('top row');
    expect(coachDefensive.spokenTip).toContain('block');

    // 2. Missed win scenario: X had [3, 4] with square 5 open, while O completed [0, 1, 2]
    const missedWinBoard = ['O', 'O', 'O', 'X', 'X', null, null, null, null] as ('X' | 'O' | null)[];
    const coachMissedWin = analyzeLoss(missedWinBoard, 'O', 'Rowan');
    expect(coachMissedWin.tipTitle).toContain('Missed Winning Chance');
    expect(coachMissedWin.criticalSquare).toBe(5);
  });
});

describe('Wonder Trivia - Content, Sizing, Speech & Question Tracking', () => {
  it('has an expanded library of 50+ diverse questions across multiple age tiers', () => {
    expect(WONDER_TRIVIA_LIBRARY.length).toBeGreaterThanOrEqual(50);
    const age3to5 = WONDER_TRIVIA_LIBRARY.filter((q) => q.minAge <= 4 && q.maxAge >= 4);
    const age6to10 = WONDER_TRIVIA_LIBRARY.filter((q) => q.minAge <= 8 && q.maxAge >= 8);
    expect(age3to5.length).toBeGreaterThanOrEqual(20);
    expect(age6to10.length).toBeGreaterThanOrEqual(20);
  });

  it('renders options with clear badges (A, B, C...) in a compact grid', async () => {
    render(<WonderTrivia profile={mockProfile} theme={mockTheme} onExit={() => {}} />);

    // Step 1: Select Solo Adventure
    const soloBtn = screen.getByRole('button', { name: /Solo Adventure/i });
    fireEvent.click(soloBtn);

    // Step 2: In Age Calibration, click Start Trivia
    const startBtn = screen.getByRole('button', { name: /Start Trivia/i });
    fireEvent.click(startBtn);

    // Wait for question card & options group
    await waitFor(() => expect(screen.getByRole('group', { name: /Answer options/i })).toBeTruthy());

    // Verify option badges A, B...
    const options = screen.getAllByRole('button', { name: /Option [A-D]:/i });
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options[0].textContent).toContain('A');
    expect(options[1].textContent).toContain('B');
  });

  it('shows compact feedback bar with auto-advance countdown upon answering', async () => {
    render(<WonderTrivia profile={mockProfile} theme={mockTheme} onExit={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Solo Adventure/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Trivia/i }));

    await waitFor(() => expect(screen.getByRole('group', { name: /Answer options/i })).toBeTruthy());

    const options = screen.getAllByRole('button', { name: /Option [A-D]:/i });
    fireEvent.click(options[0]);

    // Verify feedback bar appears with auto-advance countdown
    await waitFor(() => expect(screen.getByText(/Next ➡️/i)).toBeTruthy());
    expect(document.querySelector('.trivia-feedback-bar')).toBeTruthy();
  });
});
