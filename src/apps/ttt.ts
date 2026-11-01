export type Mark = 'X' | 'O' | null;
export type Board = Mark[];
export type Level = 'easy' | 'medium';

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

export function winner(b: Board): Mark | 'draw' | null {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? 'draw' : null;
}

/** A cell that completes a line for `m`, if any. */
export function winningMove(b: Board, m: 'X' | 'O'): number | undefined {
  for (const [a, c, d] of LINES) {
    const line = [a, c, d];
    const mine = line.filter((i) => b[i] === m).length;
    const empty = line.filter((i) => b[i] === null);
    if (mine === 2 && empty.length === 1) return empty[0];
  }
  return undefined;
}

/** The helper plays O. Never perfect, so a five-year-old can win. */
export function aiMove(b: Board, level: Level, rng: () => number = Math.random): number {
  const empty = b.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
  const random = () => empty[Math.floor(rng() * empty.length)];
  const win = winningMove(b, 'O');
  const block = winningMove(b, 'X');
  if (level === 'easy') {
    if (win !== undefined && rng() < 0.5) return win;
    if (block !== undefined && rng() < 0.4) return block;
    return random();
  }
  if (rng() < 0.2) return random();
  if (win !== undefined) return win;
  if (block !== undefined) return block;
  if (b[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => b[i] === null);
  return corners.length ? corners[Math.floor(rng() * corners.length)] : random();
}
