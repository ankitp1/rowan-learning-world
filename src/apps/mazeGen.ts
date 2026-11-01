export interface Cell { N: boolean; E: boolean; S: boolean; W: boolean }
export interface Maze { w: number; h: number; cells: Cell[][]; numbers: { x: number; y: number; n: number }[] }
export type Dir = 'N' | 'E' | 'S' | 'W';

export const STEP: Record<Dir, [number, number]> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const OPP: Record<Dir, Dir> = { N: 'S', S: 'N', E: 'W', W: 'E' };
const DIRS: Dir[] = ['N', 'E', 'S', 'W'];

/** Maze size and how many numbers to collect, by level. Level 0 is already 12x12; the cap is 30x30 with 6 numbers. */
export function mazeSpec(level: number) {
  return { size: Math.min(12 + level * 2, 30), numbers: Math.min(3 + Math.floor(level / 2), 6) };
}

/**
 * Perfect maze (exactly one route between any two cells) via an iterative depth-first search, which makes
 * long winding corridors with many dead ends. Numbers 1..k sit far from the start and spread out.
 */
export function generateMaze(w: number, h: number, k: number, rng: () => number = Math.random): Maze {
  const cells: Cell[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => ({ N: true, E: true, S: true, W: true })));
  const seen = Array.from({ length: h }, () => Array<boolean>(w).fill(false));
  const stack: [number, number][] = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = DIRS.filter((d) => {
      const nx = x + STEP[d][0], ny = y + STEP[d][1];
      return nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny][nx];
    });
    if (!opts.length) { stack.pop(); continue; }
    const d = opts[Math.floor(rng() * opts.length)];
    const nx = x + STEP[d][0], ny = y + STEP[d][1];
    cells[y][x][d] = false;
    cells[ny][nx][OPP[d]] = false;
    seen[ny][nx] = true;
    stack.push([nx, ny]);
  }
  // numbers: spread across the maze, each in its own horizontal band so he must explore, not just run a line
  const taken = new Set(['0,0', `${w - 1},${h - 1}`]);
  const numbers: Maze['numbers'] = [];
  for (let i = 0; i < k; i++) {
    let guard = 0;
    while (guard++ < 800) {
      const x = Math.floor(rng() * w);
      const bandH = h / k;
      const y = Math.min(h - 1, Math.floor(bandH * ((i + Math.floor(rng() * 1.99)) % k) + rng() * bandH));
      if (taken.has(`${x},${y}`) || x + y < 3) continue;
      taken.add(`${x},${y}`);
      numbers.push({ x, y, n: 0 });
      break;
    }
  }
  numbers.sort(() => rng() - 0.5).forEach((n, i) => { n.n = i + 1; });
  return { w, h, cells, numbers };
}

export const openDirs = (m: Maze, x: number, y: number): Dir[] => DIRS.filter((d) => !m.cells[y][x][d]);

/**
 * Run along a corridor: keep moving until a junction, dead end, number or the exit.
 * Keeps big mazes playable (one press follows the passage around corners).
 */
export function slide(m: Maze, x: number, y: number, d: Dir): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  let dir = d;
  if (m.cells[y][x][dir]) return path;
  for (let i = 0; i < m.w * m.h; i++) {
    x += STEP[dir][0]; y += STEP[dir][1];
    path.push({ x, y });
    if (m.numbers.some((n) => n.x === x && n.y === y) || (x === m.w - 1 && y === m.h - 1)) break;
    const exits = openDirs(m, x, y).filter((o) => o !== OPP[dir]);
    if (exits.length !== 1) break; // junction or dead end
    dir = exits[0];
  }
  return path;
}

/** Can you walk from (0,0) to every cell? (used by tests) */
export function reachable(m: Maze): number {
  const seen = new Set<string>(['0,0']);
  const q: [number, number][] = [[0, 0]];
  while (q.length) {
    const [x, y] = q.pop()!;
    for (const d of openDirs(m, x, y)) {
      const nx = x + STEP[d][0], ny = y + STEP[d][1];
      if (!seen.has(`${nx},${ny}`)) { seen.add(`${nx},${ny}`); q.push([nx, ny]); }
    }
  }
  return seen.size;
}

/** Length of the shortest route from start to exit (used by tests / difficulty checks). */
export function solutionLength(m: Maze): number {
  const dist = new Map<string, number>([['0,0', 0]]);
  const q: [number, number][] = [[0, 0]];
  while (q.length) {
    const [x, y] = q.shift()!;
    for (const d of openDirs(m, x, y)) {
      const nx = x + STEP[d][0], ny = y + STEP[d][1], k = `${nx},${ny}`;
      if (!dist.has(k)) { dist.set(k, dist.get(`${x},${y}`)! + 1); q.push([nx, ny]); }
    }
  }
  return dist.get(`${m.w - 1},${m.h - 1}`) ?? -1;
}
