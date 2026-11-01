/** Code Breaker (Mastermind-style) logic. Pure, so it can be tested. */
export const GEMS = [
  { color: '#e63946', glyph: '●', name: 'red' },
  { color: '#2f7fe0', glyph: '▲', name: 'blue' },
  { color: '#2a9d4a', glyph: '■', name: 'green' },
  { color: '#ffc933', glyph: '★', name: 'yellow' },
  { color: '#9b5de5', glyph: '◆', name: 'purple' },
  { color: '#ff8fab', glyph: '✚', name: 'pink' },
] as const;

/** Level -> code length, number of gem colours, whether a colour may repeat. */
export function codeSpec(level: number) {
  const table: [number, number, boolean][] = [[3, 4, false], [3, 5, false], [4, 5, false], [4, 6, false], [4, 6, true], [5, 6, true]];
  const [len, colors, repeats] = table[Math.min(level, table.length - 1)];
  return { len, colors, repeats, maxTries: len >= 5 ? 12 : 10 };
}

export function makeSecret(len: number, colors: number, repeats: boolean, rng: () => number = Math.random): number[] {
  const pool = Array.from({ length: colors }, (_, i) => i);
  const out: number[] = [];
  while (out.length < len) {
    const i = Math.floor(rng() * pool.length);
    out.push(pool[i]);
    if (!repeats) pool.splice(i, 1);
  }
  return out;
}

/** exact = right gem, right spot. near = right gem, wrong spot (each gem counted once). */
export function score(secret: number[], guess: number[]): { exact: number; near: number } {
  let exact = 0;
  const sLeft: Record<number, number> = {};
  const gLeft: Record<number, number> = {};
  secret.forEach((s, i) => {
    if (guess[i] === s) exact++;
    else { sLeft[s] = (sLeft[s] ?? 0) + 1; gLeft[guess[i]] = (gLeft[guess[i]] ?? 0) + 1; }
  });
  let near = 0;
  for (const k of Object.keys(gLeft)) near += Math.min(gLeft[+k], sLeft[+k] ?? 0);
  return { exact, near };
}

/** A gem colour that is definitely not in the code, if there is one. */
export function absentGem(secret: number[], colors: number): number | undefined {
  return Array.from({ length: colors }, (_, i) => i).find((i) => !secret.includes(i));
}
