/** Tower puzzle (Tower of Hanoi) logic. State = which peg (0-2) each disk is on; disk 0 is the smallest. */
export type Pegs = number[];

export const optimalMoves = (n: number) => 2 ** n - 1;
export const startState = (n: number): Pegs => Array(n).fill(0);
export const isWon = (s: Pegs) => s.every((p) => p === 2);

/** Smallest disk on a peg (the top of its stack), or -1 if empty. */
export const topDisk = (s: Pegs, peg: number) => s.indexOf(peg);

export function canMove(s: Pegs, from: number, to: number): boolean {
  if (from === to) return false;
  const d = topDisk(s, from);
  if (d < 0) return false;
  const t = topDisk(s, to);
  return t < 0 || t > d;
}

export function move(s: Pegs, from: number, to: number): Pegs {
  if (!canMove(s, from, to)) return s;
  const next = [...s];
  next[topDisk(s, from)] = to;
  return next;
}

/** Shortest solution from any legal position (BFS over at most 3^n states). Returns the whole move list. */
export function solve(s: Pegs): { from: number; to: number }[] {
  const key = (x: Pegs) => x.join('');
  const goal = key(Array(s.length).fill(2));
  const prev = new Map<string, { k: string; from: number; to: number } | null>([[key(s), null]]);
  const q: Pegs[] = [s];
  while (q.length) {
    const cur = q.shift()!;
    if (key(cur) === goal) break;
    for (let f = 0; f < 3; f++) for (let t = 0; t < 3; t++) {
      if (!canMove(cur, f, t)) continue;
      const n = move(cur, f, t);
      if (!prev.has(key(n))) { prev.set(key(n), { k: key(cur), from: f, to: t }); q.push(n); }
    }
  }
  const path: { from: number; to: number }[] = [];
  let k: string = goal;
  for (let step = prev.get(k); step; step = prev.get(k)) { path.push({ from: step.from, to: step.to }); k = step.k; }
  return path.reverse();
}

/** Disks by level: 3 at level 0, up to 7. */
export const disksFor = (level: number) => Math.min(3 + level, 7);
