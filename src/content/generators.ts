import wordPack from './words.json';
import type { Choice, Hint, Question, Theme } from '../core/types';
import { GROUPS, GROUP_WORDS, PLURALS } from './groups';
import { DIGRAPHS, EXPLAIN, SIGHT_WORDS, VOWELS, soundsOf, tilesOf } from './phonics';

/**
 * Question generators. One function per kind of skill; every question is tagged
 * with the skill it tests and carries (a) distractors tagged with the error they
 * represent and (b) its own three hints + an explanation, so the shared engine
 * and QuestionCard can run any skill without game-specific code.
 */

type W = { w: string; e: string };
const WORDS = wordPack as Record<string, W[]>;
const ALL_WORDS: W[] = Object.values(WORDS).flat();

export interface GenOpts {
  /** 0 = most support, 2 = least. */
  difficulty?: 0 | 1 | 2;
  /** Prompts to skip (word or "a+b") so rounds don't repeat. */
  avoid?: string[];
  rng?: () => number;
  /** Target sum for number bonds (10, 20, 50, 100). Defaults to 10. */
  target?: number;
}

type Rng = () => number;
const shuffle = <T,>(a: T[], rng: Rng): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
const pick = <T,>(a: T[], rng: Rng): T => a[Math.floor(rng() * a.length)];
const rint = (lo: number, hi: number, rng: Rng) => lo + Math.floor(rng() * (hi - lo + 1));
let counter = 0;
const qid = (s: string) => `${s}#${++counter}`;

/** Replace {thing} {things} {container} {thief} {name} in generated text with the theme's words and child's name. */
export function fill(text: string | undefined, t: Theme, childName?: string): string {
  if (!text) return '';
  const name = childName?.trim() || 'Rowan';
  return text
    .replaceAll('{things}', t.collectible.many)
    .replaceAll('{thing}', t.collectible.one)
    .replaceAll('{container}', t.container.name)
    .replaceAll('{thief}', t.thief.name)
    .replaceAll('{name}', name);
}

/* ---------------- error diagnosis ---------------- */

const REVERSALS = [['b', 'd'], ['p', 'q'], ['m', 'w'], ['n', 'u']];

/** Work out *what kind* of mistake picking `given` instead of `expected` was. */
export function diagnoseWord(expected: string, given: string): string {
  for (const dg of DIGRAPHS) {
    if (expected.includes(dg) && given === expected.replace(dg, dg[0])) return `dig:${dg}`;
  }
  const et = tilesOf(expected);
  const gt = tilesOf(given);
  if (et.length === gt.length) {
    const diff = et.map((_, i) => i).filter((i) => et[i] !== gt[i]);
    if (diff.length === 1) {
      const i = diff[0];
      const a = et[i];
      const b = gt[i];
      if (REVERSALS.some((p) => p.includes(a) && p.includes(b))) return `rev:${[a, b].sort().join('/')}`;
      if (VOWELS.includes(a) && VOWELS.includes(b)) return `vowel:${[a, b].sort().join('/')}`;
      if (DIGRAPHS.includes(a) || DIGRAPHS.includes(b)) return 'dig:swap';
      if (i === 0) return 'begin';
      if (i === et.length - 1) return 'end';
      return 'mid';
    }
  }
  return expected[0] !== given[0] ? 'begin' : 'other';
}

/* ---------------- reading ---------------- */

const skeleton = (w: string) => w.replace(/[aeiou]/g, '');
function similarity(a: string, b: string) {
  let s = 0;
  if (a[0] === b[0]) s += 2;
  if (a.at(-1) === b.at(-1)) s += 1;
  if (a.length === b.length) s += 1;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) s++;
  if (skeleton(a) === skeleton(b)) s += 3;
  return s;
}

export function wordQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  const all = WORDS[skill] ?? [];
  const fresh = all.filter((x) => !o.avoid?.includes(x.w));
  const entry = pick(fresh.length ? fresh : all, rng);

  const others = ALL_WORDS.filter((x) => x.w !== entry.w && x.e !== entry.e);
  let cands: W[];
  if (d === 0) {
    const same = all.filter((x) => x.w !== entry.w && x.e !== entry.e && x.w[0] !== entry.w[0]);
    cands = shuffle(same.length >= 2 ? same : others, rng);
  } else {
    cands = shuffle(
      others
        .map((x) => ({ x, s: similarity(entry.w, x.w) + rng() * 0.9 }))
        .sort((p, q) => q.s - p.s)
        .slice(0, d === 2 ? 4 : 7)
        .map((p) => p.x),
      rng,
    );
  }
  const ds: W[] = [];
  for (const c of cands) if (ds.length < 2 && !ds.some((x) => x.e === c.e)) ds.push(c);

  const choices: Choice[] = shuffle(
    [
      { id: entry.w, text: entry.w, emoji: entry.e },
      ...ds.map((x) => ({ id: x.w, text: x.w, emoji: x.e, tags: [diagnoseWord(entry.w, x.w)] })),
    ],
    rng,
  );
  const explain = (EXPLAIN[skill] ?? ((w) => `${w}.`))(entry.w);
  return {
    id: qid(entry.w),
    skill,
    kind: 'word',
    prompt: 'Read the word. Tap the matching picture.',
    say: 'Read the word. Tap the matching picture.',
    word: entry.w,
    emoji: entry.e,
    tiles: tilesOf(entry.w),
    sounds: soundsOf(entry.w, skill === 'read.silent-e'),
    choices,
    answer: entry.w,
    hints: [
      { text: 'Tap each letter to hear its sound.', say: 'Tap each letter to hear its sound.' },
      { text: "Let's sound it out slowly.", effect: 'soundOut' },
      { text: 'Now blend the sounds together.', effect: 'reveal' },
    ],
    explain: { text: explain, say: explain },
  };
}

export function sightQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const fresh = SIGHT_WORDS.filter((w) => !o.avoid?.includes(w));
  const word = pick(fresh.length ? fresh : SIGHT_WORDS, rng);
  const ds = shuffle(
    SIGHT_WORDS.filter((w) => w !== word).sort((a, b) => similarity(word, b) - similarity(word, a)).slice(0, 5),
    rng,
  ).slice(0, 2);
  const choices: Choice[] = shuffle(
    [{ id: word, text: word }, ...ds.map((w) => ({ id: w, text: w, tags: [diagnoseWord(word, w)] }))],
    rng,
  );
  return {
    id: qid(word),
    skill,
    kind: 'sight',
    prompt: 'Listen. Tap the word you hear.',
    say: `Tap the word, ${word}.`,
    word,
    choices,
    answer: word,
    hints: [
      { text: `It starts with the letter ${word[0]}.`, say: `It starts with ${word[0]}.` },
      { text: 'Let me say it again.', effect: 'repeat' },
      { text: "Here's the word!", effect: 'reveal' },
    ],
    explain: { text: `${word}: a sight word. Remember how it looks!`, say: `${word}. Remember how it looks!` },
  };
}

/* ---------------- math ---------------- */

function numChoices(ans: number, tagged: { n: number; tags: string[] }[], rng: Rng, crossing = false): Choice[] {
  const seen = new Set<number>([ans]);
  const out: Choice[] = [{ id: String(ans), text: String(ans) }];
  const maxChoice = Math.max(40, ans + 25);
  const add = (n: number, tags: string[]) => {
    if (n < 0 || n > maxChoice || seen.has(n) || out.length >= 3) return;
    seen.add(n);
    out.push({ id: String(n), text: String(n), tags: crossing ? [...tags, 'math:cross10'] : tags });
  };
  for (const t of shuffle(tagged, rng)) add(t.n, t.tags);
  let guard = 0;
  const spread = ans > 30 ? 5 : 3;
  while (out.length < 3 && guard++ < 30) add(Math.max(0, ans + rint(-spread, spread, rng)), []);
  return shuffle(out, rng);
}

const COUNT_HINTS = (explain: string) => ({
  hints: [
    { text: 'Try counting with your finger. Touch each {thing}.', say: 'Try counting with your finger.' },
    { text: "Let's count them one at a time.", effect: 'count' as const },
    { text: "Let's count together!", effect: 'reveal' as const },
  ],
  explain: { text: explain, say: explain },
});

export function countQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  const big = skill === 'math.count.20';
  const [lo, hi] = big ? [[11, 14], [11, 17], [14, 20]][d] : [[1, 5], [3, 10], [6, 10]][d];
  let n = rint(lo, hi, rng);
  if (o.avoid?.includes(String(n))) n = rint(lo, hi, rng);
  return {
    id: qid('count'), skill, kind: 'count',
    prompt: 'How many {things}?', say: 'How many, {things}, do you see?',
    n, support: 0,
    choices: numChoices(n, [{ n: n + 1, tags: ['math:off1'] }, { n: n - 1, tags: ['math:off1'] }], rng),
    answer: String(n),
    ...COUNT_HINTS(`We counted ${n}. Say one number for each {thing}.`),
  };
}

export function compareQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  let a = rint(1, 10, rng);
  let b = rint(1, 10, rng);
  if (d === 0) { while (Math.abs(a - b) < 3) { a = rint(1, 10, rng); b = rint(1, 10, rng); } }
  else if (d >= 1 && rng() < 0.2) b = a;
  else while (a === b) b = rint(1, 10, rng);
  const hints = [
    { text: 'Count each pile.', say: 'Count each pile.' },
    { text: "Let's count both piles.", effect: 'count' as const },
    { text: 'Look at which pile is taller!', effect: 'reveal' as const },
  ];
  const explain = a === b ? `${a} and ${b} are the same.` : `${Math.max(a, b)} is more than ${Math.min(a, b)}.`;
  if (d < 2) {
    const ans = a > b ? 'L' : a < b ? 'R' : 'S';
    const wrongTag = ['math:cmp'];
    return {
      id: qid('cmp'), skill, kind: 'compare', a, b, support: 0,
      prompt: 'Which pile has more?', say: 'Which pile has more? Left pile, right pile, or both the same?',
      choices: [
        { id: 'L', emoji: '👈', text: `Left Pile (${a})`, tags: a < b ? wrongTag : [] },
        { id: 'S', emoji: '🤝', text: 'Both the Same', tags: a !== b ? wrongTag : [] },
        { id: 'R', emoji: '👉', text: `Right Pile (${b})`, tags: a > b ? wrongTag : [] },
      ],
      answer: ans, hints, explain: { text: explain, say: explain },
    };
  }
  const sign = a > b ? '>' : a < b ? '<' : '=';
  return {
    id: qid('cmp'), skill, kind: 'compare', a, b, support: 2,
    prompt: 'Which sign fits?', say: `Which sign fits, ${a}, and, ${b}?`,
    choices: ['<', '=', '>'].map((s) => ({ id: s, text: s, tags: s === sign ? [] : ['math:cmp'] })),
    answer: sign, hints, explain: { text: explain, say: explain },
  };
}

export function addQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  const [smin, smax] = skill === 'math.add.5' ? [2, 5] : skill === 'math.add.10' ? [6, 10] : [11, 20];
  let a = 0, b = 0, s = 0, tries = 0;
  do {
    s = rint(smin, smax, rng);
    a = rint(Math.max(1, s - 12), Math.min(12, s - 1), rng);
    b = s - a;
  } while (o.avoid?.includes(`${a}+${b}`) && tries++ < 8);
  const crossing = a <= 10 && s > 10;
  const tagged = [{ n: s + 1, tags: ['math:off1'] }, { n: s - 1, tags: ['math:off1'] }];
  if (a > b) tagged.push({ n: a - b, tags: ['math:sub-for-add'] });
  return {
    id: qid('add'), skill, kind: 'add', a, b, support: d as 0 | 1 | 2,
    prompt: `${a} + ${b} = ?`, say: `${a} plus ${b}. How many {things} altogether?`,
    choices: numChoices(s, tagged, rng, crossing), answer: String(s),
    hints: [
      { text: 'Try counting with your finger.', say: 'Try counting with your finger.' },
      { text: "Let's count them on the number line.", effect: 'count' },
      { text: `Start at ${a} and count ${b} more.`, effect: 'reveal' },
    ],
    explain: { text: `${a} and ${b} more makes ${s}.`, say: `${a} and ${b} more makes ${s}.` },
  };
}

export function make10Question(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  const target = o.target ?? 10;

  let a: number;
  let ans: number;
  let tagged: { n: number; tags: string[] }[] = [];

  if (target === 20) {
    let tries = 0;
    do {
      a = rint(2, 18, rng);
      ans = 20 - a;
    } while (o.avoid?.includes(`${a}+${ans}`) && tries++ < 10);

    const off1Plus = ans + 1 <= 20 ? ans + 1 : ans - 2;
    const off1Minus = ans - 1 >= 1 ? ans - 1 : ans + 2;
    const teenConfusion = ans <= 10 ? ans + 10 : ans - 10;
    tagged = [
      { n: off1Plus, tags: ['math:off1'] },
      { n: off1Minus, tags: ['math:off1'] },
      { n: teenConfusion, tags: ['math:teen'] },
    ];
  } else if (target === 50) {
    const candidates = [10, 15, 20, 25, 30, 35, 40, 45, 12, 18, 22, 28, 32, 38];
    a = pick(candidates, rng);
    ans = 50 - a;
    tagged = [
      { n: ans + 10, tags: ['math:off10'] },
      { n: ans - 10 > 0 ? ans - 10 : ans + 5, tags: ['math:off10'] },
      { n: ans + 1, tags: ['math:off1'] },
    ];
  } else if (target === 100) {
    const candidates = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 85, 90, 35, 45, 65];
    a = pick(candidates, rng);
    ans = 100 - a;
    tagged = [
      { n: ans + 10, tags: ['math:off10'] },
      { n: ans - 10 > 0 ? ans - 10 : ans + 20, tags: ['math:off10'] },
      { n: ans + 5, tags: ['math:off5'] },
    ];
  } else {
    // Default Target: 10
    a = rint(1, 9, rng);
    ans = 10 - a;
    tagged = [
      { n: ans + 1, tags: ['math:off1'] },
      { n: ans - 1, tags: ['math:off1'] },
    ];
  }

  const hints: Hint[] =
    target === 10
      ? [
          { text: `Hold up ${a} fingers. How many more to reach 10?`, say: `Hold up ${a} fingers. How many more to reach 10?` },
          { text: "Let's fill the ten frame.", effect: 'count' },
          { text: `Count up from ${a} to 10.`, effect: 'reveal' },
        ]
      : target === 20
      ? [
          { text: `Think: fill to 10 first, then reach 20!`, say: `Fill to 10 first, then reach 20!` },
          { text: `How many more does ${a} need to reach 20?`, effect: 'count' },
          { text: `Count up from ${a} to 20.`, effect: 'reveal' },
        ]
      : target === 50
      ? [
          { text: `Count by tens from ${a} up to 50.`, say: `Count by tens from ${a} up to 50.` },
          { text: `How many tens and ones make 50?`, effect: 'count' },
          { text: `Count up from ${a} to 50.`, effect: 'reveal' },
        ]
      : [
          { text: `Think in tens: what plus ${Math.floor(a / 10) * 10} makes 100?`, say: `What plus ${Math.floor(a / 10) * 10} makes 100?` },
          { text: `Count by tens to 100.`, effect: 'count' },
          { text: `Count up from ${a} to 100.`, effect: 'reveal' },
        ];

  return {
    id: qid('m10'),
    skill,
    kind: 'make10',
    a,
    b: ans,
    target,
    support: d as 0 | 1 | 2,
    prompt: `${a} + ? = ${target}`,
    say: `${a} plus what makes ${target}?`,
    choices: numChoices(ans, tagged, rng),
    answer: String(ans),
    hints,
    explain: { text: `${a} and ${ans} make ${target}.`, say: `${a} and ${ans} make ${target}.` },
  };
}

export function subQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  let a = 0, b = 0, tries = 0;
  do {
    if (skill === 'math.sub.5') { a = rint(2, 5, rng); b = rint(1, a, rng); }
    else if (skill === 'math.sub.10') { a = rint(6, 10, rng); b = rint(1, a - 1, rng); }
    else { a = rint(11, 20, rng); b = rint(2, 10, rng); }
  } while (o.avoid?.includes(`${a}-${b}`) && tries++ < 8);
  const r = a - b;
  const crossing = a > 10 && r < 10;
  return {
    id: qid('sub'), skill, kind: 'sub', a, b, support: d as 0 | 1 | 2,
    prompt: `${a} − ${b} = ?`,
    say: `You have ${a} {things}. The {thief} takes ${b}. How many are left?`,
    choices: numChoices(r, [
      { n: r + 1, tags: ['math:off1'] }, { n: r - 1, tags: ['math:off1'] }, { n: a + b, tags: ['math:add-for-sub'] },
    ], rng, crossing),
    answer: String(r),
    hints: [
      { text: 'Cross out the ones the {thief} took.', say: 'Cross out the ones the {thief} took.' },
      { text: "Let's count what is left.", effect: 'count' },
      { text: "Let's count what's left together.", effect: 'reveal' },
    ],
    explain: { text: `${a} take away ${b} leaves ${r}.`, say: `${a} take away ${b} leaves ${r}.` },
  };
}


/* ---------------- rhyming ---------------- */

export interface RhymeEntry {
  w: string;
  e: string;
  rime: string;
  tier: 0 | 1 | 2;
  onset?: string;
}

export const ADVANCED_RHYME_BANK: RhymeEntry[] = [
  // --- Tier 0: CVC & early phonics ---
  { w: 'cat', e: '🐱', rime: 'at', tier: 0, onset: 'c' },
  { w: 'hat', e: '🎩', rime: 'at', tier: 0, onset: 'h' },
  { w: 'bat', e: '🦇', rime: 'at', tier: 0, onset: 'b' },
  { w: 'rat', e: '🐀', rime: 'at', tier: 0, onset: 'r' },

  { w: 'dog', e: '🐶', rime: 'og', tier: 0, onset: 'd' },
  { w: 'log', e: '🪵', rime: 'og', tier: 0, onset: 'l' },
  { w: 'frog', e: '🐸', rime: 'og', tier: 0, onset: 'fr' },

  { w: 'pig', e: '🐷', rime: 'ig', tier: 0, onset: 'p' },
  { w: 'dig', e: '⛏️', rime: 'ig', tier: 0, onset: 'd' },
  { w: 'wig', e: '👱', rime: 'ig', tier: 0, onset: 'w' },

  { w: 'bug', e: '🐛', rime: 'ug', tier: 0, onset: 'b' },
  { w: 'rug', e: '🧶', rime: 'ug', tier: 0, onset: 'r' },
  { w: 'mug', e: '☕', rime: 'ug', tier: 0, onset: 'm' },

  { w: 'pan', e: '🍳', rime: 'an', tier: 0, onset: 'p' },
  { w: 'fan', e: '🪭', rime: 'an', tier: 0, onset: 'f' },
  { w: 'van', e: '🚐', rime: 'an', tier: 0, onset: 'v' },

  { w: 'net', e: '🥅', rime: 'et', tier: 0, onset: 'n' },
  { w: 'jet', e: '✈️', rime: 'et', tier: 0, onset: 'j' },
  { w: 'vet', e: '🧑‍⚕️', rime: 'et', tier: 0, onset: 'v' },

  { w: 'fox', e: '🦊', rime: 'ox', tier: 0, onset: 'f' },
  { w: 'box', e: '📦', rime: 'ox', tier: 0, onset: 'b' },

  { w: 'pin', e: '📌', rime: 'in', tier: 0, onset: 'p' },
  { w: 'win', e: '🏆', rime: 'in', tier: 0, onset: 'w' },
  { w: 'bin', e: '🗑️', rime: 'in', tier: 0, onset: 'b' },

  { w: 'pot', e: '🍲', rime: 'ot', tier: 0, onset: 'p' },
  { w: 'hot', e: '🔥', rime: 'ot', tier: 0, onset: 'h' },

  // --- Tier 1: Blends, Digraphs, Vowel Teams & Silent-E ---
  { w: 'train', e: '🚂', rime: 'ain', tier: 1, onset: 'tr' },
  { w: 'rain', e: '🌧️', rime: 'ain', tier: 1, onset: 'r' },
  { w: 'chain', e: '⛓️', rime: 'ain', tier: 1, onset: 'ch' },
  { w: 'brain', e: '🧠', rime: 'ain', tier: 1, onset: 'br' },

  { w: 'clock', e: '⏰', rime: 'ock', tier: 1, onset: 'cl' },
  { w: 'block', e: '🧱', rime: 'ock', tier: 1, onset: 'bl' },
  { w: 'sock', e: '🧦', rime: 'ock', tier: 1, onset: 's' },
  { w: 'rock', e: '🪨', rime: 'ock', tier: 1, onset: 'r' },

  { w: 'truck', e: '🛻', rime: 'uck', tier: 1, onset: 'tr' },
  { w: 'duck', e: '🦆', rime: 'uck', tier: 1, onset: 'd' },

  { w: 'star', e: '⭐', rime: 'ar', tier: 1, onset: 'st' },
  { w: 'car', e: '🚗', rime: 'ar', tier: 1, onset: 'c' },
  { w: 'jar', e: '🫙', rime: 'ar', tier: 1, onset: 'j' },
  { w: 'guitar', e: '🎸', rime: 'ar', tier: 1, onset: 'g' },

  { w: 'snake', e: '🐍', rime: 'ake', tier: 1, onset: 'sn' },
  { w: 'cake', e: '🎂', rime: 'ake', tier: 1, onset: 'c' },
  { w: 'lake', e: '🏞️', rime: 'ake', tier: 1, onset: 'l' },

  { w: 'snail', e: '🐌', rime: 'ail', tier: 1, onset: 'sn' },
  { w: 'whale', e: '🐳', rime: 'ail', tier: 1, onset: 'wh' },
  { w: 'sail', e: '⛵', rime: 'ail', tier: 1, onset: 's' },

  { w: 'moon', e: '🌙', rime: 'oon', tier: 1, onset: 'm' },
  { w: 'spoon', e: '🥄', rime: 'oon', tier: 1, onset: 'sp' },
  { w: 'balloon', e: '🎈', rime: 'oon', tier: 1, onset: 'b' },

  { w: 'crown', e: '👑', rime: 'own', tier: 1, onset: 'cr' },
  { w: 'clown', e: '🤡', rime: 'own', tier: 1, onset: 'cl' },

  { w: 'ring', e: '💍', rime: 'ing', tier: 1, onset: 'r' },
  { w: 'king', e: '👑', rime: 'ing', tier: 1, onset: 'k' },
  { w: 'wing', e: '🪽', rime: 'ing', tier: 1, onset: 'w' },
  { w: 'swing', e: '🛝', rime: 'ing', tier: 1, onset: 'sw' },

  { w: 'shark', e: '🦈', rime: 'ark', tier: 1, onset: 'sh' },
  { w: 'park', e: '🏞️', rime: 'ark', tier: 1, onset: 'p' },

  { w: 'boat', e: '⛵', rime: 'oat', tier: 1, onset: 'b' },
  { w: 'coat', e: '🧥', rime: 'oat', tier: 1, onset: 'c' },
  { w: 'goat', e: '🐐', rime: 'oat', tier: 1, onset: 'g' },

  { w: 'nest', e: '🪺', rime: 'est', tier: 1, onset: 'n' },
  { w: 'vest', e: '🦺', rime: 'est', tier: 1, onset: 'v' },
  { w: 'chest', e: '🧰', rime: 'est', tier: 1, onset: 'ch' },

  { w: 'bell', e: '🔔', rime: 'ell', tier: 1, onset: 'b' },
  { w: 'shell', e: '🐚', rime: 'ell', tier: 1, onset: 'sh' },

  { w: 'tree', e: '🌳', rime: 'ee', tier: 1, onset: 'tr' },
  { w: 'bee', e: '🐝', rime: 'ee', tier: 1, onset: 'b' },

  { w: 'house', e: '🏠', rime: 'ouse', tier: 1, onset: 'h' },
  { w: 'mouse', e: '🐭', rime: 'ouse', tier: 1, onset: 'm' },

  { w: 'bear', e: '🐻', rime: 'air', tier: 1, onset: 'b' },
  { w: 'chair', e: '🪑', rime: 'air', tier: 1, onset: 'ch' },
  { w: 'pear', e: '🍐', rime: 'air', tier: 1, onset: 'p' },

  // --- Tier 2: Multi-Syllable & Complex Phonics Rhymes ---
  { w: 'dragon', e: '🐲', rime: 'agon', tier: 2, onset: 'dr' },
  { w: 'wagon', e: '🛒', rime: 'agon', tier: 2, onset: 'w' },

  { w: 'kitten', e: '🐱', rime: 'itten', tier: 2, onset: 'k' },
  { w: 'mitten', e: '🧤', rime: 'itten', tier: 2, onset: 'm' },

  { w: 'rocket', e: '🚀', rime: 'ocket', tier: 2, onset: 'r' },
  { w: 'pocket', e: '👖', rime: 'ocket', tier: 2, onset: 'p' },

  { w: 'mountain', e: '🏔️', rime: 'untain', tier: 2, onset: 'm' },
  { w: 'fountain', e: '⛲', rime: 'untain', tier: 2, onset: 'f' },

  { w: 'flower', e: '🌸', rime: 'ower', tier: 2, onset: 'fl' },
  { w: 'tower', e: '🗼', rime: 'ower', tier: 2, onset: 't' },

  { w: 'river', e: '🌊', rime: 'iver', tier: 2, onset: 'r' },
  { w: 'shiver', e: '🥶', rime: 'iver', tier: 2, onset: 'sh' },

  { w: 'thunder', e: '⚡', rime: 'under', tier: 2, onset: 'th' },
  { w: 'wonder', e: '🤔', rime: 'under', tier: 2, onset: 'w' },

  { w: 'spider', e: '🕷️', rime: 'ider', tier: 2, onset: 'sp' },
  { w: 'glider', e: '🪂', rime: 'ider', tier: 2, onset: 'gl' },

  { w: 'cheetah', e: '🐆', rime: 'eetah', tier: 2, onset: 'ch' },
  { w: 'meter', e: '📏', rime: 'eetah', tier: 2, onset: 'm' },

  { w: 'candle', e: '🕯️', rime: 'andle', tier: 2, onset: 'c' },
  { w: 'handle', e: '🚪', rime: 'andle', tier: 2, onset: 'h' },
];

const BANK_BY_WORD = new Map<string, RhymeEntry>(ADVANCED_RHYME_BANK.map((x) => [x.w, x]));

/** Rime getter with lookup in advanced bank, falling back to vowel-split. */
export const rimeOf = (w: string): string => {
  const hit = BANK_BY_WORD.get(w);
  if (hit) return hit.rime;
  const i = w.search(/[aeiou]/);
  return i < 0 ? w : w.slice(i);
};

const RHYME_FAMILIES_BY_TIER: Record<number, RhymeEntry[][]> = (() => {
  const byTier: Record<number, Map<string, RhymeEntry[]>> = { 0: new Map(), 1: new Map(), 2: new Map() };
  for (const x of ADVANCED_RHYME_BANK) {
    const m = byTier[x.tier];
    m.set(x.rime, [...(m.get(x.rime) ?? []).filter((y) => y.e !== x.e), x]);
  }
  return {
    0: [...byTier[0].values()].filter((f) => f.length >= 2),
    1: [...byTier[1].values()].filter((f) => f.length >= 2),
    2: [...byTier[2].values()].filter((f) => f.length >= 2),
  };
})();

export function rhymeQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;

  // Select candidate families based on difficulty tier:
  // Tier 0: CVC & early phonics
  // Tier 1: Blends, digraphs, vowel teams, silent-e
  // Tier 2: Multi-syllable & complex challenge rhymes
  let famPool: RhymeEntry[][];
  if (d === 0) {
    famPool = RHYME_FAMILIES_BY_TIER[0];
  } else if (d === 1) {
    famPool = [...RHYME_FAMILIES_BY_TIER[0], ...RHYME_FAMILIES_BY_TIER[1]];
  } else {
    famPool = [...RHYME_FAMILIES_BY_TIER[1], ...RHYME_FAMILIES_BY_TIER[2]];
  }

  const fresh = famPool.filter((f) => f.some((x) => !o.avoid?.includes(x.w)));
  const fam = pick(fresh.length ? fresh : famPool, rng);
  const [target, match] = shuffle(fam, rng);
  const rime = target.rime;

  // Candidate distractors: words with a strictly different rime and different emoji
  const candidatePool = ADVANCED_RHYME_BANK.filter(
    (x) => x.rime !== rime && x.e !== target.e && x.e !== match.e && x.w !== target.w && x.w !== match.w
  );

  const ds: RhymeEntry[] = [];

  // For intermediate and advanced difficulties, craft phonological trap distractors:
  if (d >= 1) {
    // 1. Onset / Alliteration trap: shares initial blend/letter with target (e.g. train -> truck, snake -> snail)
    const targetOnset = target.onset || target.w.slice(0, 2);
    const onsetMatches = candidatePool.filter(
      (x) => (x.onset && x.onset === target.onset) || x.w.startsWith(targetOnset) || x.w[0] === target.w[0]
    );
    if (onsetMatches.length > 0) {
      ds.push(pick(onsetMatches, rng));
    }
  }

  // Fill remaining distractor slots (up to 2 distractors total, so 3 choices)
  const remaining = shuffle(
    candidatePool.filter((c) => !ds.some((x) => x.w === c.w || x.e === c.e)),
    rng
  );
  for (const c of remaining) {
    if (ds.length >= 2) break;
    ds.push(c);
  }

  const tag = (x: RhymeEntry) => {
    if (x.onset && target.onset && x.onset === target.onset) return ['rhyme:begin'];
    if (x.w[0] === target.w[0]) return ['rhyme:begin'];
    if (x.rime[0] === rime[0]) return ['rhyme:vowel'];
    return [];
  };

  const explain = `${target.w} and ${match.w} rhyme! They both end with the -${rime} sound.`;

  return {
    id: qid('rhyme'),
    skill,
    kind: 'rhyme',
    prompt: `Which one rhymes with ${target.w}?`,
    say: `Which one rhymes with ${target.w}?`,
    word: target.w,
    emoji: target.e,
    choices: shuffle(
      [
        { id: match.w, text: match.w, emoji: match.e },
        ...ds.map((x) => ({ id: x.w, text: x.w, emoji: x.e, tags: tag(x) })),
      ],
      rng
    ),
    answer: match.w,
    hints: [
      { text: `Say ${target.w} out loud. Listen to how it ends.`, say: `Say ${target.w} out loud. Listen to how it ends.` },
      { text: 'I will take one away.', effect: 'eliminate' },
      { text: `${target.w} and ${match.w} sound the same at the end: -${rime}!`, say: `${target.w}, ${match.w}. They sound the same at the end.`, effect: 'reveal' },
    ],
    explain: { text: explain, say: explain },
  };
}

/* ---------------- following written directions (Captain's Log) ---------------- */

const COLORS: Record<string, string> = { red: '#e63946', blue: '#2f7fe0', green: '#2a9d4a', yellow: '#ffc933' };
const SHAPES = ['circle', 'square', 'triangle', 'star'] as const;
type Item = { size: 'big' | 'small'; color: string; shape: (typeof SHAPES)[number] };
const itemId = (i: Item) => `${i.size}-${i.color}-${i.shape}`;

export function followQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  const colorNames = Object.keys(COLORS);
  const attrs = d === 0 ? [rng() < 0.5 ? 'color' : 'shape'] : d === 1 ? ['color', 'shape'] : ['size', 'color', 'shape'];
  const target: Item = { size: pick(['big', 'small'], rng), color: pick(colorNames, rng), shape: pick([...SHAPES], rng) };
  const total = d === 0 ? 4 : d === 1 ? 5 : 6;
  const items = new Map<string, Item>([[itemId(target), target]]);
  const mismatched = (x: Item) => attrs.filter((a) => x[a as keyof Item] !== target[a as keyof Item]);
  let guard = 0;
  while (items.size < total && guard++ < 300) {
    const x: Item = { size: pick(['big', 'small'], rng), color: pick(colorNames, rng), shape: pick([...SHAPES], rng) };
    if (d === 0 && attrs[0] === 'color' && [...items.values()].some((y) => y.color === x.color)) continue;
    if (d === 0 && attrs[0] === 'shape' && [...items.values()].some((y) => y.shape === x.shape)) continue;
    if (!mismatched(x).length) continue; // would also match the directions
    if (d >= 1 && mismatched(x).length > 1 && items.size < total - 2) continue; // mostly near misses, so he has to read every word
    items.set(itemId(x), x);
  }
  const prompt = `Tap the ${attrs.includes('size') ? `${target.size} ` : ''}${attrs.includes('color') ? `${target.color} ` : ''}${attrs.includes('shape') ? target.shape : 'shape'}.`;
  const words = [attrs.includes('size') ? target.size : '', attrs.includes('color') ? target.color : '', attrs.includes('shape') ? target.shape : ''].filter(Boolean);
  return {
    id: qid('follow'), skill, kind: 'follow', prompt, silent: true, say: prompt,
    choices: shuffle([...items.values()].map((x) => ({
      id: itemId(x), shape: { kind: x.shape, color: COLORS[x.color], big: x.size === 'big' },
      tags: itemId(x) === itemId(target) ? undefined : mismatched(x).map((a) => `follow:${a}`),
    })), rng),
    answer: itemId(target),
    hints: [
      { text: 'Read it again, one word at a time.', say: 'Read it again, one word at a time.' },
      { text: 'I will take one away.', effect: 'eliminate' },
      { text: `Look for: ${words.join(', ')}.`, say: `Look for: ${words.join(', ')}.`, effect: 'reveal' },
    ],
    explain: { text: `The directions said ${words.join(', ')}. Only one shape has all of that.`, say: `The directions said ${words.join(', ')}. Only one shape has all of that.` },
  };
}

/* ---------------- group names and plurals ---------------- */

const regularPlural = (w: string) => (/(s|x|sh|ch)$/.test(w) ? `${w}es` : `${w}s`);

/**
 * Group Names. Difficulty 0: everyday group words. 1: adds common ones and easy plurals.
 * 2: tricky group words and plurals that change. b === 1 marks a plural question.
 * Two thirds of questions are group names, one third plurals.
 */
export function groupQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  const plural = rng() < 0.34;
  if (plural) {
    const pool = PLURALS.filter((p) => p.lvl <= d);
    const fresh = pool.filter((p) => !o.avoid?.includes(p.one));
    const it = pick(fresh.length ? fresh : pool, rng);
    const wrong: Choice[] = [];
    const add = (text: string, tag: string) => { if (text !== it.many && !wrong.some((c) => c.id === text)) wrong.push({ id: text, text, tags: [tag] }); };
    if (it.type === 'odd') add(regularPlural(it.one), 'plural:regular');
    add(it.one, 'plural:same');
    const other = pick(PLURALS.filter((p) => p.one !== it.one && p.many !== it.one), rng);
    add(it.type === 'regular' ? other.many : `${it.many}s`, 'plural:mix');
    const choices = shuffle([{ id: it.many, text: it.many }, ...wrong.slice(0, 2)], rng);
    const say = `One ${it.one}. Now there are lots. Two what?`;
    const explain = it.one === it.many
      ? `One ${it.one}, two ${it.many}. This word does not change!`
      : `One ${it.one}, two ${it.many}.${it.type === 'odd' ? ' This word is tricky. It changes shape.' : ''}`;
    return {
      id: qid('group'), skill, kind: 'group', word: it.one, emoji: it.emoji, b: 1,
      prompt: `One ${it.one}. Two ___?`, say, choices, answer: it.many,
      hints: [
        { text: `Say it out loud: "two ___". Which one sounds right?`, say: `Say it out loud. Two what? Which one sounds right?` },
        { text: 'I will take one away.', effect: 'eliminate' },
        { text: `The answer is ${it.many}.`, say: `One ${it.one}, two ${it.many}.`, effect: 'reveal' },
      ],
      explain: { text: explain, say: explain },
    };
  }
  const pool = GROUPS.filter((g) => g.lvl <= d);
  const fresh = pool.filter((g) => !o.avoid?.includes(g.noun));
  const it = pick(fresh.length ? fresh : pool, rng);
  const answer = it.ok[0];
  const wrongWords = shuffle(GROUP_WORDS.filter((w) => !it.ok.includes(w)), rng);
  // easy: pick wrong words that are clearly different; harder: still any, but deck/pair/stack-type words stay in
  const wrong = wrongWords.slice(0, 2).map((w) => ({ id: w, text: w, tags: ['group:mix'] }));
  const choices = shuffle([{ id: answer, text: answer }, ...wrong], rng);
  const explain = `A group of ${it.noun} is called a ${answer}. A ${answer} of ${it.noun}!`;
  return {
    id: qid('group'), skill, kind: 'group', word: it.noun, emoji: it.emoji, b: 0,
    prompt: `A ___ of ${it.noun}`, say: `What do we call a group of ${it.noun}? A what of ${it.noun}?`, choices, answer,
    hints: [
      { text: `Think about ${it.noun}. Have you seen lots of them together?`, say: `Think about ${it.noun}. Have you seen lots of them together?` },
      { text: 'I will take one away.', effect: 'eliminate' },
      { text: `A ${answer} of ${it.noun}.`, say: `A ${answer} of ${it.noun}.`, effect: 'reveal' },
    ],
    explain: { text: explain, say: explain },
  };
}

/* ---------------- dispatcher ---------------- */

export function makeQuestion(skill: string, o: GenOpts = {}): Question {
  if (skill === 'read.sight') return sightQuestion(skill, o);
  if (skill === 'read.rhyme') return rhymeQuestion(skill, o);
  if (skill === 'read.comp.follow') return followQuestion(skill, o);
  if (skill === 'read.groups') return groupQuestion(skill, o);
  if (skill.startsWith('read.comp')) throw new Error('Comprehension questions come from story packs');
  if (skill.startsWith('read.')) return wordQuestion(skill, o);
  if (skill.startsWith('math.count')) return countQuestion(skill, o);
  if (skill === 'math.compare') return compareQuestion(skill, o);
  if (skill === 'math.make10') return make10Question(skill, o);
  if (skill.startsWith('math.add')) return addQuestion(skill, o);
  if (skill.startsWith('math.sub')) return subQuestion(skill, o);
  throw new Error(`No generator for ${skill}`);
}

/** Key used to avoid repeating a question inside a round. */
export const avoidKey = (q: Question) =>
  q.kind === 'word' || q.kind === 'sight' || q.kind === 'rhyme' || q.kind === 'group' ? q.word! : q.kind === 'count' ? String(q.n) : q.kind === 'follow' ? q.prompt : `${q.a}${q.kind === 'sub' ? '-' : '+'}${q.b}`;
