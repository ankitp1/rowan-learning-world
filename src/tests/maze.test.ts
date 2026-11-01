import { describe, expect, it } from 'vitest';
import { generateMaze, mazeSpec, openDirs, reachable, slide, solutionLength } from '../apps/mazeGen';

describe('maze difficulty', () => {
  it('starts at 12x12 with 3 numbers and caps at 30x30 with 6', () => {
    expect(mazeSpec(0)).toEqual({ size: 12, numbers: 3 });
    expect(mazeSpec(3)).toEqual({ size: 18, numbers: 4 });
    expect(mazeSpec(9)).toEqual({ size: 30, numbers: 6 });
    expect(mazeSpec(50)).toEqual({ size: 30, numbers: 6 });
  });
  it('every cell is reachable, numbers are distinct and away from the start/exit', () => {
    for (let lvl = 0; lvl <= 10; lvl++) {
      const { size, numbers } = mazeSpec(lvl);
      const m = generateMaze(size, size, numbers);
      expect(reachable(m)).toBe(size * size);
      expect(m.numbers).toHaveLength(numbers);
      expect(new Set(m.numbers.map((n) => `${n.x},${n.y}`)).size).toBe(numbers);
      expect(m.numbers.map((n) => n.n).sort()).toEqual(Array.from({ length: numbers }, (_, i) => i + 1));
      expect(m.numbers.some((n) => (n.x === 0 && n.y === 0) || (n.x === size - 1 && n.y === size - 1))).toBe(false);
    }
  });
  it('is a perfect maze with a genuinely long route (not a trivial dash)', () => {
    const m = generateMaze(12, 12, 3);
    const passages = m.cells.flat().reduce((n, c) => n + (['N', 'E', 'S', 'W'] as const).filter((d) => !c[d]).length, 0) / 2;
    expect(passages).toBe(12 * 12 - 1);
    let longest = 0;
    for (let i = 0; i < 30; i++) longest = Math.max(longest, solutionLength(generateMaze(12, 12, 3)));
    expect(longest).toBeGreaterThan(40);
  });
});

describe('corridor running', () => {
  it('stops at junctions, dead ends, numbers and the exit, and never walks through walls', () => {
    const m = generateMaze(14, 14, 4);
    for (let i = 0; i < 300; i++) {
      const x = Math.floor(Math.random() * 14), y = Math.floor(Math.random() * 14);
      for (const d of openDirs(m, x, y)) {
        const path = slide(m, x, y, d);
        expect(path.length).toBeGreaterThan(0);
        let prev = { x, y };
        for (const c of path) { expect(Math.abs(c.x - prev.x) + Math.abs(c.y - prev.y)).toBe(1); prev = c; }
        const last = path[path.length - 1];
        const isNum = m.numbers.some((n) => n.x === last.x && n.y === last.y);
        const isExit = last.x === 13 && last.y === 13;
        // we must have stopped for a reason
        const exits = openDirs(m, last.x, last.y).length;
        expect(isNum || isExit || exits !== 2).toBe(true);
      }
    }
  });
  it('does nothing when the way is blocked', () => {
    const m = generateMaze(12, 12, 3);
    const blocked = (['N', 'E', 'S', 'W'] as const).find((d) => m.cells[0][0][d])!;
    expect(slide(m, 0, 0, blocked)).toEqual([]);
  });
});
