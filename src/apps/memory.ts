import words from '../content/words.json';

/** Memory Match deck logic. */
export type Mode = 'pictures' | 'letters' | 'numbers';
export interface Card { id: string; pair: string; kind: 'emoji' | 'letter' | 'number' | 'dots'; value: string | number; word?: string }

const POOL = Object.values(words as Record<string, { w: string; e: string }[]>).flat();

/** Grid size by level (always an even number of cards). */
export function gridFor(level: number): { rows: number; cols: number; pairs: number } {
  const g = [[2, 3], [3, 4], [4, 4], [4, 5], [5, 6], [6, 6]][Math.min(level, 5)];
  return { rows: g[0], cols: g[1], pairs: (g[0] * g[1]) / 2 };
}

const shuffle = <T,>(a: T[], rng: () => number) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function makeDeck(mode: Mode, pairs: number, rng: () => number = Math.random): Card[] {
  const cards: Card[] = [];
  if (mode === 'pictures') {
    const seen = new Set<string>();
    for (const w of shuffle(POOL, rng)) {
      if (cards.length >= pairs * 2) break;
      if (seen.has(w.e)) continue;
      seen.add(w.e);
      cards.push({ id: `${w.w}a`, pair: w.w, kind: 'emoji', value: w.e, word: w.w }, { id: `${w.w}b`, pair: w.w, kind: 'emoji', value: w.e, word: w.w });
    }
  } else if (mode === 'letters') {
    const letters = new Set<string>();
    const seen = new Set<string>();
    for (const w of shuffle(POOL, rng)) {
      if (cards.length >= pairs * 2) break;
      const l = w.w[0];
      if (letters.has(l) || seen.has(w.e)) continue;
      letters.add(l); seen.add(w.e);
      cards.push({ id: `${l}L`, pair: l, kind: 'letter', value: l }, { id: `${l}P`, pair: l, kind: 'emoji', value: w.e, word: w.w });
    }
  } else {
    const max = Math.max(pairs, 10);
    for (const n of shuffle(Array.from({ length: max }, (_, i) => i + 1), rng).slice(0, pairs)) {
      cards.push({ id: `n${n}`, pair: String(n), kind: 'number', value: n }, { id: `d${n}`, pair: String(n), kind: 'dots', value: n });
    }
  }
  return shuffle(cards, rng);
}

export const isMatch = (a: Card, b: Card) => a.id !== b.id && a.pair === b.pair;
