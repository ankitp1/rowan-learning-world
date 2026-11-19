// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { shuffleArray } from '../core/engine';
import { FLAG_CAPITAL_LIBRARY } from '../content/flagsCapitals';
import { DETECTIVE_CASES } from '../content/geoDetective';
import { WONDER_TRIVIA_LIBRARY } from '../content/wonderTrivia';

describe('Choice Randomization - Non-deterministic Option Positions', () => {
  it('shuffleArray utility preserves all items and randomizes order', () => {
    const original = ['A', 'B', 'C', 'D'];
    const positions = new Set<number>();

    for (let i = 0; i < 50; i++) {
      const shuffled = shuffleArray(original);
      expect(shuffled).toHaveLength(4);
      expect(shuffled.sort()).toEqual(['A', 'B', 'C', 'D']);
      const posA = shuffleArray(original).indexOf('A');
      positions.add(posA);
    }

    // Over 50 runs, 'A' must appear in multiple positions, not just index 0
    expect(positions.size).toBeGreaterThan(1);
  });

  it('verifies that in Flag & Capital trivia, correct answers are distributed across multiple indices', () => {
    const correctIndices = new Set<number>();

    // Simulate 40 picks of questions with shuffled choices
    for (let i = 0; i < 40; i++) {
      const q = FLAG_CAPITAL_LIBRARY[i % FLAG_CAPITAL_LIBRARY.length];
      const randomizedChoices = shuffleArray(q.choices);
      const correctIdx = randomizedChoices.findIndex((c) => c.correct);
      expect(correctIdx).toBeGreaterThanOrEqual(0);
      correctIndices.add(correctIdx);
    }

    // Correct answer must not always be at index 0 (Option A)
    expect(correctIndices.size).toBeGreaterThan(1);
    expect(correctIndices.has(1) || correctIndices.has(2) || correctIndices.has(3)).toBe(true);
  });

  it('verifies that in Geography Detective, suspect destinations are distributed across multiple indices', () => {
    const correctIndices = new Set<number>();

    // Simulate 40 cases with shuffled choices
    for (let i = 0; i < 40; i++) {
      const c = DETECTIVE_CASES[i % DETECTIVE_CASES.length];
      const randomizedChoices = shuffleArray(c.choices);
      const correctIdx = randomizedChoices.findIndex((choice) => choice.correct);
      expect(correctIdx).toBeGreaterThanOrEqual(0);
      correctIndices.add(correctIdx);
    }

    // Correct destination must not always be at index 0 (Option A)
    expect(correctIndices.size).toBeGreaterThan(1);
    expect(correctIndices.has(1) || correctIndices.has(2) || correctIndices.has(3)).toBe(true);
  });

  it('verifies that in Wonder Trivia, correct choices are distributed across multiple indices', () => {
    const correctIndices = new Set<number>();

    for (let i = 0; i < 40; i++) {
      const q = WONDER_TRIVIA_LIBRARY[i % WONDER_TRIVIA_LIBRARY.length];
      const randomizedChoices = shuffleArray(q.choices);
      const correctIdx = randomizedChoices.findIndex((choice) => choice.correct);
      expect(correctIdx).toBeGreaterThanOrEqual(0);
      correctIndices.add(correctIdx);
    }

    expect(correctIndices.size).toBeGreaterThan(1);
    expect(correctIndices.has(1) || correctIndices.has(2) || correctIndices.has(3)).toBe(true);
  });
});
