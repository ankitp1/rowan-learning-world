// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEMES, formatThemeEncouragement, formatThemeMapTitle, formatThemePersonality, formatThemePraise } from '../core/themes';
import { fill } from '../content/generators';
import { speakThemeEncouragement, speakThemeGreeting, speakThemePraise } from '../core/speech';
import QuestionCard from '../ui/QuestionCard';
import type { Profile, Question } from '../core/types';

vi.mock('../core/speech', async () => {
  const actual = await vi.importActual<typeof import('../core/speech')>('../core/speech');
  return {
    ...actual,
    speak: vi.fn().mockResolvedValue(undefined),
    speakThemePraise: vi.fn().mockResolvedValue(undefined),
    speakThemeEncouragement: vi.fn().mockResolvedValue(undefined),
    speakThemeGreeting: vi.fn().mockResolvedValue(undefined),
    stopSpeaking: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockProfile: Profile = {
  id: 'p-rowan',
  name: 'Rowan',
  avatar: '🧒',
  themeId: 'western',
  age: 6,
  readingStage: 'phonics',
  mathStage: 'add10',
  levels: {},
  focusSkills: [],
  placementDone: true,
  stars: 10,
  stickers: [],
  missionsDone: 1,
  settings: { dailyMinutes: 0, hintMode: 'full', speechRate: 0.9, allowedThemes: [], disabledApps: [], timerMode: 'off' },
  createdAt: Date.now(),
};

describe('Name Interpolation & Audio Personalization', () => {
  it('replaces {name} in all theme praises and encouragements across all themes', () => {
    for (const theme of THEMES) {
      for (let i = 0; i < (theme.praise?.length || 0); i++) {
        const praise = formatThemePraise(theme, i, 'Rowan');
        expect(praise).not.toContain('{name}');
        if (theme.praise[i].includes('{name}')) {
          expect(praise).toContain('Rowan');
        }
      }

      for (let i = 0; i < (theme.encouragements?.length || 0); i++) {
        const enc = formatThemeEncouragement(theme, i, 'Rowan');
        expect(enc).not.toContain('{name}');
        if (theme.encouragements[i].includes('{name}')) {
          expect(enc).toContain('Rowan');
        }
      }

      const mapTitle = formatThemeMapTitle(theme, 'Rowan');
      expect(mapTitle).not.toContain('{name}');
      expect(mapTitle).toContain('Rowan');

      const personality = formatThemePersonality(theme, 'Rowan');
      expect(personality).not.toContain('{name}');
    }
  });

  it('fill() helper safely resolves {name} and falls back to Rowan if childName omitted', () => {
    const westernTheme = THEMES.find((t) => t.id === 'western')!;
    const res1 = fill('Howdy, {name}! Collect all the {things}!', westernTheme, 'Rowan');
    expect(res1).toBe(`Howdy, Rowan! Collect all the ${westernTheme.collectible.many}!`);
    expect(res1).not.toContain('{name}');

    const res2 = fill('Great job, {name}!', westernTheme);
    expect(res2).toBe('Great job, Rowan!');
    expect(res2).not.toContain('{name}');
  });

  it('renders QuestionCard without {name} leaking onto the screen in speech bubbles', () => {
    const mockQuestion: Question = {
      id: 'q-test-1',
      kind: 'count',
      prompt: 'Count the {things}, {name}!',
      n: 4,
      choices: [
        { id: '4', text: '4' },
        { id: '3', text: '3' },
      ],
      answer: '4',
      explain: { text: 'You counted 4 {things}, {name}!' },
      skill: 'math.count',
      hints: [],
    };

    const westernTheme = THEMES.find((t) => t.id === 'western')!;
    render(
      <QuestionCard
        q={mockQuestion}
        theme={westernTheme}
        profile={mockProfile}
        onResult={() => {}}
      />
    );

    // Verify prompt on screen does not have {name}
    expect(screen.queryByText(/\{name\}/)).toBeNull();
    expect(screen.getByText(new RegExp(`Count the ${westernTheme.collectible.many}, Rowan!`))).toBeDefined();
  });
});
