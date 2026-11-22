import words from '../content/words.json';

/** Memory Match deck logic. */
export type Mode = 'pictures' | 'dinos' | 'animals' | 'space' | 'ocean' | 'vehicles' | 'flags' | 'rhymes' | 'letters' | 'numbers';
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
    { w: 'Velociraptor', e: '🦎' },
    { w: 'Amber fossil', e: '🪨' },
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
    { w: 'Red fox', e: '🦊' },
    { w: 'Polar bear', e: '🐻‍❄️' },
    { w: 'Wise owl', e: '🦉' },
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
    { w: 'Sparkling star', e: '⭐' },
    { w: 'Comet meteor', e: '☄️' },
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
    { w: 'Tropical ray', e: '🐡' },
    { w: 'Lobster', e: '🦞' },
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
    { w: 'Tractor', e: '🚜' },
    { w: 'Submarine', e: '🛥️' },
  ],
  flags: [
    { w: 'United States', e: '🇺🇸' },
    { w: 'United Kingdom', e: '🇬🇧' },
    { w: 'France', e: '🇫🇷' },
    { w: 'Japan', e: '🇯🇵' },
    { w: 'Canada', e: '🇨🇦' },
    { w: 'Brazil', e: '🇧🇷' },
    { w: 'Australia', e: '🇦🇺' },
    { w: 'India', e: '🇮🇳' },
    { w: 'Germany', e: '🇩🇪' },
    { w: 'Italy', e: '🇮🇹' },
    { w: 'Spain', e: '🇪🇸' },
    { w: 'Mexico', e: '🇲🇽' },
    { w: 'Egypt', e: '🇪🇬' },
    { w: 'Greece', e: '🇬🇷' },
    { w: 'South Korea', e: '🇰🇷' },
  ],
};

export const RHYME_PAIRS: { rime: string; a: { w: string; e: string }; b: { w: string; e: string } }[] = [
  { rime: 'at', a: { w: 'Cat', e: '🐱' }, b: { w: 'Hat', e: '🎩' } },
  { rime: 'og', a: { w: 'Frog', e: '🐸' }, b: { w: 'Dog', e: '🐶' } },
  { rime: 'ar', a: { w: 'Star', e: '⭐' }, b: { w: 'Car', e: '🚗' } },
  { rime: 'ain', a: { w: 'Train', e: '🚂' }, b: { w: 'Rain', e: '🌧️' } },
  { rime: 'oon', a: { w: 'Moon', e: '🌙' }, b: { w: 'Spoon', e: '🥄' } },
  { rime: 'ake', a: { w: 'Snake', e: '🐍' }, b: { w: 'Cake', e: '🎂' } },
  { rime: 'own', a: { w: 'Crown', e: '👑' }, b: { w: 'Clown', e: '🤡' } },
  { rime: 'ee', a: { w: 'Bee', e: '🐝' }, b: { w: 'Tree', e: '🌳' } },
  { rime: 'ouse', a: { w: 'House', e: '🏠' }, b: { w: 'Mouse', e: '🐭' } },
  { rime: 'agon', a: { w: 'Dragon', e: '🐲' }, b: { w: 'Wagon', e: '🛒' } },
  { rime: 'ocket', a: { w: 'Rocket', e: '🚀' }, b: { w: 'Pocket', e: '👖' } },
  { rime: 'uck', a: { w: 'Truck', e: '🛻' }, b: { w: 'Duck', e: '🦆' } },
  { rime: 'ock', a: { w: 'Clock', e: '⏰' }, b: { w: 'Rock', e: '🪨' } },
  { rime: 'ail', a: { w: 'Snail', e: '🐌' }, b: { w: 'Whale', e: '🐳' } },
  { rime: 'air', a: { w: 'Bear', e: '🐻' }, b: { w: 'Chair', e: '🪑' } },
];

/** Grid size by level (always an even number of cards). */
export function gridFor(level: number): { rows: number; cols: number; pairs: number } {
  const g = [[2, 3], [3, 4], [4, 4], [4, 5], [4, 6], [5, 6]][Math.min(level, 5)];
  return { rows: g[0], cols: g[1], pairs: (g[0] * g[1]) / 2 };
}

const shuffle = <T,>(a: T[], rng: () => number) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function makeDeck(mode: Mode, pairs: number, rng: () => number = Math.random): Card[] {
  const cards: Card[] = [];
  if (mode === 'rhymes') {
    const selected = shuffle(RHYME_PAIRS, rng).slice(0, pairs);
    for (const p of selected) {
      cards.push(
        { id: `${p.a.w}1`, pair: `rime:${p.rime}`, kind: 'emoji', value: p.a.e, word: p.a.w },
        { id: `${p.b.w}2`, pair: `rime:${p.rime}`, kind: 'emoji', value: p.b.e, word: p.b.w },
      );
    }
  } else if (mode in THEME_DECKS) {
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

