import words from '../content/words.json';

/** Memory Match deck logic. */
export type Mode = 'pictures' | 'dinos' | 'animals' | 'space' | 'ocean' | 'vehicles' | 'letters' | 'numbers';
export interface Card { id: string; pair: string; kind: 'emoji' | 'letter' | 'number' | 'dots'; value: string | number; word?: string }

const POOL = Object.values(words as Record<string, { w: string; e: string }[]>).flat();

export const THEME_DECKS: Record<string, { w: string; e: string }[]> = {
  dinos: [
    { w: 'T-Rex', e: '🦖' },
    { w: 'Brachiosaurus', e: '🦕' },
    { w: 'Triceratops', e: '🦏' },
    { w: 'Pterodactyl', e: '🦅' },
    { w: 'Dino egg', e: '🥚' },
    { w: 'Fossil bone', e: '🦴' },
    { w: 'Volcano', e: '🌋' },
    { w: 'Footprint', e: '👣' },
    { w: 'Prehistoric palm', e: '🌴' },
    { w: 'Dragonfly', e: '🪰' },
  ],
  animals: [
    { w: 'Lion', e: '🦁' },
    { w: 'Tiger', e: '🐯' },
    { w: 'Elephant', e: '🐘' },
    { w: 'Giraffe', e: '🦒' },
    { w: 'Playful monkey', e: '🐵' },
    { w: 'Panda bear', e: '🐼' },
    { w: 'Zebra', e: '🦓' },
    { w: 'Penguin', e: '🐧' },
    { w: 'Koala', e: '🐨' },
    { w: 'Kangaroo', e: '🦘' },
    { w: 'Puppy dog', e: '🐶' },
    { w: 'Kitten', e: '🐱' },
  ],
  space: [
    { w: 'Rocket ship', e: '🚀' },
    { w: 'Astronaut', e: '👨‍🚀' },
    { w: 'Planet Saturn', e: '🪐' },
    { w: 'Friendly alien', e: '👽' },
    { w: 'Full moon', e: '🌕' },
    { w: 'Shooting star', e: '🌠' },
    { w: 'Flying saucer', e: '🛸' },
    { w: 'Telescope', e: '🔭' },
    { w: 'Bright sun', e: '☀️' },
    { w: 'Space satellite', e: '🛰️' },
  ],
  ocean: [
    { w: 'Dolphin', e: '🐬' },
    { w: 'Giant octopus', e: '🐙' },
    { w: 'Great white shark', e: '🦈' },
    { w: 'Sea turtle', e: '🐢' },
    { w: 'Clownfish', e: '🐠' },
    { w: 'Blue whale', e: '🐳' },
    { w: 'Starfish', e: '⭐' },
    { w: 'Pincer crab', e: '🦀' },
    { w: 'Jellyfish', e: '🪼' },
    { w: 'Seahorse', e: '🫧' },
  ],
  vehicles: [
    { w: 'Fire engine', e: '🚒' },
    { w: 'Race car', e: '🏎️' },
    { w: 'Jet airplane', e: '✈️' },
    { w: 'Steam train', e: '🚂' },
    { w: 'Rocket', e: '🚀' },
    { w: 'Police car', e: '🚓' },
    { w: 'Helicopter', e: '🚁' },
    { w: 'Speedboat', e: '🚤' },
    { w: 'Motorcycle', e: '🏍️' },
    { w: 'School bus', e: '🚌' },
  ],
};

/** Grid size by level (always an even number of cards). */
export function gridFor(level: number): { rows: number; cols: number; pairs: number } {
  const g = [[2, 3], [3, 4], [4, 4], [4, 5], [5, 6], [6, 6]][Math.min(level, 5)];
  return { rows: g[0], cols: g[1], pairs: (g[0] * g[1]) / 2 };
}

const shuffle = <T,>(a: T[], rng: () => number) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function makeDeck(mode: Mode, pairs: number, rng: () => number = Math.random): Card[] {
  const cards: Card[] = [];
  if (mode in THEME_DECKS) {
    const pool = THEME_DECKS[mode];
    const seen = new Set<string>();
    for (const w of shuffle(pool, rng)) {
      if (cards.length >= pairs * 2) break;
      if (seen.has(w.e)) continue;
      seen.add(w.e);
      cards.push({ id: `${w.w}a`, pair: w.w, kind: 'emoji', value: w.e, word: w.w }, { id: `${w.w}b`, pair: w.w, kind: 'emoji', value: w.e, word: w.w });
    }
  } else if (mode === 'pictures') {
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

