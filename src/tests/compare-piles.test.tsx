// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { compareQuestion } from '../content/generators';
import { themeById } from '../core/themes';
import { MathVisual } from '../ui/Visuals';

afterEach(() => {
  cleanup();
});

describe('Compare Piles - Non-wrapping layout and intuitive choices', () => {
  it('generates clear Left Pile, Right Pile, and Same choices instead of confusing arrows', () => {
    for (let i = 0; i < 30; i++) {
      const q = compareQuestion('math.compare', { difficulty: 0 });
      expect(q.prompt).toBe('Which pile has more?');
      expect(q.choices).toHaveLength(3);

      const leftChoice = q.choices.find((c) => c.id === 'L');
      const rightChoice = q.choices.find((c) => c.id === 'R');
      const sameChoice = q.choices.find((c) => c.id === 'S');

      expect(leftChoice).toBeDefined();
      expect(rightChoice).toBeDefined();
      expect(sameChoice).toBeDefined();

      // Verify clear intuitive labels
      expect(leftChoice!.text).toContain('Left Pile');
      expect(leftChoice!.emoji).toBe('👈');

      expect(rightChoice!.text).toContain('Right Pile');
      expect(rightChoice!.emoji).toBe('👉');

      expect(sameChoice!.text).toBe('Both the Same');
      expect(sameChoice!.emoji).toBe('🤝');

      // Verify answer logic
      const expectedAns = q.a! > q.b! ? 'L' : q.a! < q.b! ? 'R' : 'S';
      expect(q.answer).toBe(expectedAns);
    }
  });

  it('renders side-by-side pile tags (👈 Left Pile, Right Pile 👉) and VS badge in Visuals', () => {
    const q = compareQuestion('math.compare', { difficulty: 0 });
    const theme = themeById('pirate');

    render(
      <MathVisual
        q={q}
        theme={theme}
        hi={null}
        hintLevel={0}
      />
    );

    // Verify both pile tags are present
    expect(screen.getByText('👈 Left Pile')).toBeTruthy();
    expect(screen.getByText('Right Pile 👉')).toBeTruthy();
    expect(screen.getByText('VS')).toBeTruthy();

    // Verify .piles container exists
    const pilesContainer = document.querySelector('.piles');
    expect(pilesContainer).toBeTruthy();
    expect(document.querySelectorAll('.pile-side')).toHaveLength(2);
  });
});
