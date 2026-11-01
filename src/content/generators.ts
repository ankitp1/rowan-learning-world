import wordPack from './words.json';
import type { Choice, Question, Theme } from '../core/types';
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

/** Replace {thing} {things} {container} {thief} in generated text with the theme's words. */
export function fill(text: string | undefined, t: Theme): string {
  if (!text) return '';
  return text
    .replaceAll('{things}', t.collectible.many)
    .replaceAll('{thing}', t.collectible.one)
    .replaceAll('{container}', t.container.name)
    .replaceAll('{thief}', t.thief.name);
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
  const add = (n: number, tags: string[]) => {
    if (n < 0 || n > 40 || seen.has(n) || out.length >= 3) return;
    seen.add(n);
    out.push({ id: String(n), text: String(n), tags: crossing ? [...tags, 'math:cross10'] : tags });
  };
  for (const t of shuffle(tagged, rng)) add(t.n, t.tags);
  let guard = 0;
  while (out.length < 3 && guard++ < 30) add(Math.max(0, ans + rint(-3, 3, rng)), []);
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
      prompt: 'Which pile has more?', say: 'Which pile has more?',
      choices: [
        { id: 'L', emoji: '⬅️', text: 'This one', tags: a < b ? wrongTag : [] },
        { id: 'S', emoji: '🟰', text: 'Same', tags: wrongTag },
        { id: 'R', emoji: '➡️', text: 'This one', tags: a > b ? wrongTag : [] },
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
  const a = rint(1, 9, rng);
  const ans = 10 - a;
  return {
    id: qid('m10'), skill, kind: 'make10', a, b: ans, support: d as 0 | 1 | 2,
    prompt: `${a} + ? = 10`, say: `${a} plus what makes 10?`,
    choices: numChoices(ans, [{ n: ans + 1, tags: ['math:off1'] }, { n: ans - 1, tags: ['math:off1'] }], rng),
    answer: String(ans),
    hints: [
      { text: `Hold up ${a} fingers. How many more to reach 10?`, say: `Hold up ${a} fingers. How many more to reach 10?` },
      { text: "Let's fill the ten frame.", effect: 'count' },
      { text: `Count up from ${a} to 10.`, effect: 'reveal' },
    ],
    explain: { text: `${a} and ${ans} make 10.`, say: `${a} and ${ans} make 10.` },
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

/** "cat" -> "at", "ship" -> "ip", "snake" -> "ake": everything from the first vowel on. */
export const rimeOf = (w: string) => { const i = w.search(/[aeiou]/); return i < 0 ? w : w.slice(i); };

const RHYME_FAMILIES: W[][] = (() => {
  const by = new Map<string, W[]>();
  for (const x of ALL_WORDS) { const r = rimeOf(x.w); by.set(r, [...(by.get(r) ?? []).filter((y) => y.e !== x.e), x]); }
  return [...by.values()].filter((f) => f.length >= 2);
})();

export function rhymeQuestion(skill: string, o: GenOpts = {}): Question {
  const rng = o.rng ?? Math.random;
  const d = o.difficulty ?? 1;
  const fresh = RHYME_FAMILIES.filter((f) => f.some((x) => !o.avoid?.includes(x.w)));
  const fam = pick(fresh.length ? fresh : RHYME_FAMILIES, rng);
  const [target, match] = shuffle(fam, rng);
  const rime = rimeOf(target.w);
  const others = ALL_WORDS.filter((x) => rimeOf(x.w) !== rime && x.e !== target.e && x.e !== match.e);
  const near = (x: W) => (rimeOf(x.w)[0] === rime[0] ? 2 : 0) + (x.w[0] === target.w[0] ? 2 : 0);
  const pool = d === 0 ? shuffle(others, rng) : shuffle(others, rng).sort((p, q) => near(q) - near(p)).slice(0, 8);
  const ds: W[] = [];
  for (const c of shuffle(pool, rng)) if (ds.length < 2 && !ds.some((x) => x.e === c.e)) ds.push(c);
  const tag = (x: W) => (rimeOf(x.w)[0] === rime[0] ? ['rhyme:vowel'] : x.w[0] === target.w[0] ? ['rhyme:begin'] : []);
  const explain = `${target.w} and ${match.w} rhyme. They both end with -${rime}.`;
  return {
    id: qid('rhyme'), skill, kind: 'rhyme',
    prompt: `Which one rhymes with ${target.w}?`, say: `Which one rhymes with ${target.w}?`,
    word: target.w, emoji: target.e,
    choices: shuffle([{ id: match.w, text: match.w, emoji: match.e }, ...ds.map((x) => ({ id: x.w, text: x.w, emoji: x.e, tags: tag(x) }))], rng),
    answer: match.w,
    hints: [
      { text: `Say ${target.w} out loud. Listen to how it ends.`, say: `Say ${target.w} out loud. Listen to how it ends.` },
      { text: 'I will take one away.', effect: 'eliminate' },
      { text: `${target.w} and ${match.w} sound the same at the end.`, say: `${target.w}, ${match.w}. They sound the same at the end.`, effect: 'reveal' },
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
