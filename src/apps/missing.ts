import words from '../content/words.json';

/** What's Missing? round generator. */
const EMOJI = [...new Set(Object.values(words as Record<string, { w: string; e: string }[]>).flat().map((x) => x.e))];

export interface MissingRound { items: string[]; missing: number[]; options: string[]; study: number; shuffleAfter: boolean }

const shuffle = <T,>(a: T[], rng: () => number) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function roundSpec(level: number) {
  return {
    count: Math.min(4 + level, 10),
    missing: level >= 3 ? 2 : 1,
    study: Math.max(3, 9 - level),
    shuffleAfter: level >= 4,
  };
}

export function makeRound(level: number, rng: () => number = Math.random): MissingRound {
  const spec = roundSpec(level);
  const pool = shuffle(EMOJI, rng);
  const items = pool.slice(0, spec.count);
  const missing = shuffle(items.map((_, i) => i), rng).slice(0, spec.missing).sort((a, b) => a - b);
  const decoys = pool.slice(spec.count, spec.count + 3);
  const options = shuffle([...missing.map((i) => items[i]), ...decoys], rng);
  return { items, missing, options, study: spec.study, shuffleAfter: spec.shuffleAfter };
}
