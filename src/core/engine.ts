/**
 * Adaptive learning engine.
 *
 * Pure logic (mastery, status, spaced review, what-to-serve-next, placement,
 * in-session tracker) plus thin helpers that write to the db. Games never touch
 * mastery directly: they log attempts, and the engine does the rest.
 */
import { getDB, patchProfile, setGameLevel, todayKey, update } from './db';
import { ladder, ladderIndex, skillById } from './skills';
import type { Attempt, MathStage, MiniApp, Profile, ReadingStage, RecentAttempt, SkillState, SkillStatus, Subject } from './types';

export const DAY = 86_400_000;
export const REVIEW_DAYS = [3, 7, 21];
const RECENT_MAX = 12;
/** Each older attempt counts 80% as much as the next newer one, so one slip knocks a skill out of Mastered. */
const RECENCY = 0.8;

/* ---------------- mastery ---------------- */

/** Weighted recent accuracy 0-100: newer counts more, answers that needed hints count less. */
export function computeMastery(recent: RecentAttempt[]): number {
  if (!recent.length) return 0;
  let num = 0;
  let den = 0;
  recent.forEach((r, i) => {
    const age = recent.length - 1 - i;
    const w = Math.pow(RECENCY, age);
    const credit = r.c ? (r.h === 0 ? 1 : r.h === 1 ? 0.7 : 0.4) : 0;
    num += w * credit;
    den += w;
  });
  return Math.round((100 * num) / den);
}

export function statusOf(s?: SkillState): SkillStatus {
  if (!s || (s.attempts === 0 && !s.placed)) return 'new';
  if (s.mastery >= 85 && s.days.length >= 2 && (s.recent?.length ?? 0) >= 5) return 'mastered';
  if (s.mastery >= 60) return 'getting';
  return 'practicing';
}

export const STATUS_LABEL: Record<SkillStatus, string> = {
  new: '🆕 New', practicing: '🟡 Practicing', getting: '🟢 Getting it', mastered: '⭐ Mastered',
};

export function blankState(skillId: string): SkillState {
  return { skillId, mastery: 0, attempts: 0, correct: 0, lastSeen: 0, days: [], status: 'new', reviewStep: 0 };
}

/** Fold one attempt into a skill's state (pure). */
export function applyAttempt(prev: SkillState | undefined, skillId: string, a: Attempt): SkillState {
  const s: SkillState = prev
    ? { ...prev, days: [...prev.days], recent: [...(prev.recent ?? [])], errors: { ...(prev.errors ?? {}) } }
    : { ...blankState(skillId), recent: [], errors: {} };
  const before = prev ? statusOf(prev) : 'new';
  s.attempts += 1;
  if (a.correct) {
    s.correct += 1;
    const day = todayKey(a.at);
    if (!s.days.includes(day)) s.days.push(day);
  } else if (a.errorTags?.length) {
    for (const tag of a.errorTags) {
      const ex = a.expected && a.given ? `${a.expected}→${a.given}` : '';
      s.errors![tag] = { n: (s.errors![tag]?.n ?? 0) + 1, ex: ex || s.errors![tag]?.ex || '' };
    }
  }
  s.recent!.push({ c: a.correct ? 1 : 0, h: a.hintsUsed, t: a.ms });
  if (s.recent!.length > RECENT_MAX) s.recent = s.recent!.slice(-RECENT_MAX);
  s.mastery = computeMastery(s.recent!);
  s.lastSeen = a.at;
  s.status = statusOf(s);

  // Spaced review: 3 -> 7 -> 21 days. A slip drops it back to practicing and makes it due now.
  if (s.status === 'mastered') {
    if (before !== 'mastered') { s.reviewStep = 0; s.nextReview = a.at + REVIEW_DAYS[0] * DAY; }
    else if (a.correct && s.nextReview !== undefined && a.at >= s.nextReview) {
      s.reviewStep = Math.min(s.reviewStep + 1, REVIEW_DAYS.length - 1);
      s.nextReview = a.at + REVIEW_DAYS[s.reviewStep] * DAY;
    }
  } else if (before === 'mastered') {
    s.reviewStep = 0;
    s.nextReview = a.at;
  }
  return s;
}

/** Log an attempt and update every skill it touched. */
export function logAttempt(profileId: string, a: Omit<Attempt, 'at'> & { at?: number }) {
  const attempt: Attempt = { ...a, at: a.at ?? Date.now() };
  update((d) => {
    (d.attempts[profileId] ??= []).push(attempt);
    d.skills[profileId] ??= {};
    for (const id of attempt.skillIds) {
      d.skills[profileId][id] = applyAttempt(d.skills[profileId][id], id, attempt);
    }
  });
}

export const statesOf = (profileId: string): Record<string, SkillState> => getDB().skills[profileId] ?? {};

/* ---------------- what to serve next ---------------- */

/** First skill at/after the child's level that isn't mastered yet (respecting the parent's cap). */
export function frontier(profile: Profile, subject: Subject, states = statesOf(profile.id)) {
  const L = ladder(subject);
  const start = Math.min(profile.levels[subject] ?? 0, L.length - 1);
  const cap = profile.lockLevels?.[subject];
  for (let i = start; i < L.length; i++) {
    if (cap !== undefined && i > cap) break;
    if (statusOf(states[L[i].id]) !== 'mastered') return L[i];
  }
  return L[Math.min(cap ?? L.length - 1, L.length - 1)];
}

export type Bucket = 'current' | 'review' | 'stretch' | 'confidence' | 'focus';

export interface Pick { skillId: string; bucket: Bucket }

/**
 * Choose the next skill from `allowed` (the skills a mini-app can serve).
 * ~70% current, 20% review, 10% stretch. Parent-pinned skills get a share;
 * a frustrated child gets a confidence builder instead.
 */
export function pickSkill(
  profile: Profile, subject: Subject, allowed: string[],
  opts: { frustrated?: boolean; rng?: () => number; now?: number; states?: Record<string, SkillState> } = {},
): Pick {
  const rng = opts.rng ?? Math.random;
  const now = opts.now ?? Date.now();
  const states = opts.states ?? statesOf(profile.id);
  const L = ladder(subject);
  const rank = (id: string) => L.findIndex((s) => s.id === id);
  const app = allowed.filter((id) => rank(id) >= 0).sort((a, b) => rank(a) - rank(b));
  if (!app.length) return { skillId: allowed[Math.floor(rng() * allowed.length)], bucket: 'current' };

  const f = frontier(profile, subject, states);
  const fIdx = rank(f.id);
  const cap = profile.lockLevels?.[subject];
  const ok = (id: string) => cap === undefined || rank(id) <= cap;
  const notMastered = (id: string) => statusOf(states[id]) !== 'mastered';

  const current = app.find((id) => rank(id) >= fIdx && ok(id) && notMastered(id))
    ?? [...app].reverse().find((id) => ok(id) && notMastered(id))
    ?? app.reduce((best, id) => (Math.abs(rank(id) - fIdx) < Math.abs(rank(best) - fIdx) ? id : best), app[0]);

  const seen = app.filter((id) => id !== current && (states[id]?.attempts || states[id]?.placed));
  const due = seen.filter((id) => (states[id]?.nextReview ?? Infinity) <= now);
  const review = due[0] ?? [...seen].sort((a, b) => (states[a]?.mastery ?? 0) - (states[b]?.mastery ?? 0))[0];
  const stretch = app.find((id) => rank(id) > rank(current) && ok(id));
  const focus = profile.focusSkills.filter((id) => app.includes(id));

  if (opts.frustrated) {
    const easy = seen.filter((id) => (states[id]?.mastery ?? 0) >= 60).sort((a, b) => (states[b]?.mastery ?? 0) - (states[a]?.mastery ?? 0))[0]
      ?? app[0];
    return { skillId: easy, bucket: 'confidence' };
  }
  const r = rng();
  if (focus.length && r < 0.3) return { skillId: focus[Math.floor(rng() * focus.length)], bucket: 'focus' };
  if (r < 0.7 || (!review && !stretch)) return { skillId: current, bucket: 'current' };
  if (r < 0.9) return review ? { skillId: review, bucket: 'review' } : { skillId: current, bucket: 'current' };
  return stretch ? { skillId: stretch, bucket: 'stretch' } : { skillId: current, bucket: 'current' };
}

/** Starting support level for a skill from its mastery. */
export function baseDifficulty(skillId: string, states: Record<string, SkillState>): 0 | 1 | 2 {
  const s = states[skillId];
  if (!s || s.attempts === 0) return 1;
  return s.mastery < 45 ? 0 : s.mastery < 75 ? 1 : 2;
}

/* ---------------- in-session adaptation ---------------- */

/** 3 right in a row = a bit harder; 2 wrong = easier + proactive hint; long stalls trip the frustration guard. */
export class Tracker {
  streak = 0;
  misses = 0;
  stuck = 0;
  delta = 0;

  record(correct: boolean, ms: number) {
    if (correct) {
      this.streak++; this.misses = 0;
      if (this.streak >= 3) { this.delta = Math.min(1, this.delta + 1); this.streak = 0; }
    } else {
      this.misses++; this.streak = 0;
      if (this.misses >= 2) this.delta = Math.max(-1, this.delta - 1);
    }
    if (ms > 30_000) this.stuck++; else if (correct) this.stuck = 0;
  }
  get frustrated() { return this.misses >= 3 || this.stuck >= 2; }
  get proactiveHint() { return this.misses >= 2; }
  difficulty(base: 0 | 1 | 2): 0 | 1 | 2 {
    return Math.max(0, Math.min(2, base + this.delta)) as 0 | 1 | 2;
  }
}

/* ---------------- placement "Treasure Hunt" ---------------- */

/**
 * Binary search up the ladder. At each rung ask up to 3 questions (2 agreeing
 * results decide it). Pass -> search higher, fail -> search lower. Roughly 8-14
 * questions for a 10-13 rung ladder.
 */
export class Placement {
  readonly rungs;
  lo = 0;
  hi: number;
  best = -1;
  mid: number;
  right = 0;
  wrong = 0;
  total = 0;
  done = false;

  constructor(readonly subject: Subject, startRung?: number) {
    this.rungs = ladder(subject);
    this.hi = this.rungs.length - 1;
    this.mid = startRung !== undefined
      ? Math.max(0, Math.min(this.hi, startRung))
      : Math.floor((this.lo + this.hi) / 2);
  }
  get skill() { return this.rungs[this.mid]; }

  submit(correct: boolean) {
    if (this.done) return;
    this.total++;
    if (correct) this.right++; else this.wrong++;
    const decided = this.right >= 2 || this.wrong >= 2 || this.total >= 40;
    if (!decided) return;
    if (this.right > this.wrong) { this.best = this.mid; this.lo = this.mid + 1; } else this.hi = this.mid - 1;
    this.right = 0; this.wrong = 0;
    if (this.lo > this.hi) this.done = true; else this.mid = Math.floor((this.lo + this.hi) / 2);
  }

  /** Ladder index to start at: the first rung he hasn't shown he knows. */
  get level() { return Math.min(this.best + 1, this.rungs.length - 1); }
}

/** Save a placement result: set the level, seed everything below it as "placed" (to be reviewed later). */
export function applyPlacement(profileId: string, subject: Subject, level: number) {
  const L = ladder(subject);
  update((d) => {
    d.skills[profileId] ??= {};
    for (let i = 0; i < Math.min(level, L.length); i++) {
      const id = L[i].id;
      if (!d.skills[profileId][id]) {
        d.skills[profileId][id] = {
          ...blankState(id), mastery: 75, placed: true, status: 'getting',
          lastSeen: Date.now(), nextReview: Date.now() + 2 * DAY, recent: [],
        };
      }
    }
    const p = d.profiles.find((x) => x.id === profileId);
    if (p) { p.levels[subject] = level; p.updatedAt = Math.max(Date.now(), (p.updatedAt ?? 0) + 1); }
  });
}

/* ---------------- age & readiness calibration ---------------- */

export const READING_STAGES: { id: ReadingStage; label: string; desc: string; startRung: number; disablePhonics: boolean }[] = [
  {
    id: 'beginner',
    label: 'Beginning Reader',
    desc: 'Learning letter sounds & short 3-letter words (cat, dog, sun)',
    startRung: 0,
    disablePhonics: false,
  },
  {
    id: 'phonics',
    label: 'Sounding Out Words',
    desc: 'Practicing phonics, blends (sh, ch, th) & 4-letter words',
    startRung: 5,
    disablePhonics: false,
  },
  {
    id: 'fluent',
    label: 'Already Reading!',
    desc: 'Skips phonics games — focuses on stories, written clues & directions',
    startRung: 11,
    disablePhonics: true,
  },
];

export const MATH_STAGES: { id: MathStage; label: string; desc: string; startRung: number; disableCounting: boolean }[] = [
  {
    id: 'counting',
    label: 'Counting & Comparing',
    desc: 'Counting up to 10 & 20, and spotting more / fewer',
    startRung: 0,
    disableCounting: false,
  },
  {
    id: 'add10',
    label: 'Adding & Subtracting to 10',
    desc: 'Putting groups together and taking away within 10',
    startRung: 3,
    disableCounting: false,
  },
  {
    id: 'advanced20',
    label: 'Advanced Math (to 20)',
    desc: 'Skips basic counting — focuses on Making 10 & Add/Subtract to 20',
    startRung: 7,
    disableCounting: true,
  },
];

export function defaultStagesForAge(age: number): { readingStage: ReadingStage; mathStage: MathStage } {
  if (age <= 4) return { readingStage: 'beginner', mathStage: 'counting' };
  if (age === 5) return { readingStage: 'phonics', mathStage: 'add10' };
  return { readingStage: 'fluent', mathStage: 'advanced20' };
}

/**
 * Calibrate starting skill rungs, enabled/disabled apps, and brain-game levels
 * based on the child's age and parent-selected reading/math stages.
 */
export function applyAgeCalibration(
  profileId: string,
  opts: { age: number; readingStage: ReadingStage; mathStage: MathStage; markPlacementDone?: boolean },
) {
  const rStage = READING_STAGES.find((x) => x.id === opts.readingStage) ?? READING_STAGES[0];
  const mStage = MATH_STAGES.find((x) => x.id === opts.mathStage) ?? MATH_STAGES[0];

  // Seed reading and math ladder levels + mark earlier rungs as placed
  applyPlacement(profileId, 'reading', rStage.startRung);
  applyPlacement(profileId, 'math', mStage.startRung);

  // Calibrate initial difficulty level of brain/logic/maze games based on age
  const gameTier = opts.age <= 4 ? 0 : opts.age === 5 ? 1 : opts.age === 6 ? 2 : 3;
  for (const prefix of ['rlw.maze', 'rlw.code', 'rlw.hanoi', 'rlw.mem', 'rlw.echo', 'rlw.miss']) {
    setGameLevel(`${prefix}.${profileId}`, gameTier);
  }

  const phonicsApps = ['word-builder', 'blend-plank'];
  const countingApps = ['coin-count'];

  patchProfile(profileId, (p) => {
    p.age = opts.age;
    p.readingStage = opts.readingStage;
    p.mathStage = opts.mathStage;
    if (opts.markPlacementDone) p.placementDone = true;

    const disabled = new Set(p.settings.disabledApps);
    for (const id of phonicsApps) {
      if (rStage.disablePhonics) disabled.add(id);
      else disabled.delete(id);
    }
    for (const id of countingApps) {
      if (mStage.disableCounting) disabled.add(id);
      else disabled.delete(id);
    }
    p.settings.disabledApps = [...disabled];
  });
}

export function setLevel(profileId: string, subject: Subject, level: number) {
  patchProfile(profileId, (p) => { p.levels[subject] = level; });
}

export function resetSkill(profileId: string, skillId: string) {
  update((d) => {
    if (d.skills[profileId]) delete d.skills[profileId][skillId];
    d.skillResets ??= {};
    d.skillResets[profileId] ??= {};
    d.skillResets[profileId][skillId] = Date.now();
  });
}

/* ---------------- missions & rewards ---------------- */

/**
 * A mission = 5 short activities: reading, math, reading (or the story), math, then a fun game.
 * Apps are chosen so each one can serve the child's current skill in that subject.
 */
export function buildMission(profile: Profile, apps: MiniApp[], rng: () => number = Math.random): string[] {
  const enabled = apps.filter((a) => !profile.settings.disabledApps.includes(a.id));
  const states = statesOf(profile.id);
  // "Extras" serve skills outside the placement ladder (story, rhyming, following directions): they add variety to reading.
  const isExtra = (a: MiniApp) => a.subject === 'reading' && a.skills.length > 0 && a.skills.every((s) => ladderIndex(s) < 0);
  const extras = enabled.filter(isExtra);
  const pickFor = (subject: Subject, avoid: string[]): MiniApp | undefined => {
    const pool = enabled.filter((a) => a.subject === subject && !a.place && a.skills.length && !isExtra(a));
    const fallbackExtras = subject === 'reading' ? extras.filter((a) => !avoid.includes(a.id)) : [];
    if (!pool.length) return fallbackExtras.length ? fallbackExtras[Math.floor(rng() * fallbackExtras.length)] : undefined;
    const f = frontier(profile, subject, states);
    const fit = pool.filter((a) => a.skills.includes(f.id));
    const cands = (fit.length ? fit : pool).filter((a) => !avoid.includes(a.id));
    if (!cands.length && fallbackExtras.length) return fallbackExtras[Math.floor(rng() * fallbackExtras.length)];
    const list = cands.length ? cands : fit.length ? fit : pool;
    return list[Math.floor(rng() * list.length)];
  };
  const out: string[] = [];
  const add = (a?: MiniApp) => { if (a) out.push(a.id); };
  add(pickFor('reading', []));
  add(pickFor('math', []));
  if (extras.length && rng() < 0.6) add(extras[Math.floor(rng() * extras.length)]); else add(pickFor('reading', out));
  add(pickFor('math', out));
  const games = enabled.filter((a) => a.subject === 'games');
  if (games.length) add(games[Math.floor(rng() * games.length)]);
  return out;
}

export function awardStars(profileId: string, n: number) {
  if (n > 0) patchProfile(profileId, (p) => { p.stars += n; });
}

/** Open a treasure chest: returns the sticker won (or undefined if the book is full). */
export function awardSticker(profile: Profile, pool: string[], rng: () => number = Math.random): string | undefined {
  const left = pool.filter((s) => !profile.stickers.includes(s));
  if (!left.length) return undefined;
  const s = left[Math.floor(rng() * left.length)];
  patchProfile(profile.id, (p) => { p.stickers.push(s); p.missionsDone = (p.missionsDone ?? 0) + 1; });
  return s;
}

/** Count a finished mission (used when the sticker book is already full). */
export function countMission(profileId: string) {
  patchProfile(profileId, (p) => { p.missionsDone = (p.missionsDone ?? 0) + 1; });
}

export const skillLabel = (id: string) => skillById(id)?.name ?? id;
export { ladderIndex };
