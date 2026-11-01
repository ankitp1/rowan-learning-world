import { describe, expect, it } from 'vitest';
import {
  DAY, Placement, REVIEW_DAYS, Tracker, applyAttempt, baseDifficulty, blankState, buildMission, computeMastery,
  frontier, pickSkill, statusOf,
} from '../core/engine';
import { ladder } from '../core/skills';
import { APPS } from '../core/registry';
import type { Attempt, Profile, SkillState } from '../core/types';

const profile = (over: Partial<Profile> = {}): Profile => ({
  id: 'p1', name: 'Rowan', avatar: '🧒', themeId: 'pirate', levels: {}, focusSkills: [], placementDone: true, stars: 0, stickers: [],
  settings: { dailyMinutes: 0, hintMode: 'full', speechRate: 0.9, allowedThemes: [], disabledApps: [] }, createdAt: 0, ...over,
});
const att = (correct: boolean, at: number, hintsUsed = 0): Attempt => ({ skillIds: ['s'], appId: 'x', correct, hintsUsed, ms: 3000, at });
const mulberry = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

describe('mastery', () => {
  it('is 100 for clean answers, lower with hints, 0 for misses', () => {
    expect(computeMastery([{ c: 1, h: 0, t: 1 }, { c: 1, h: 0, t: 1 }])).toBe(100);
    expect(computeMastery([{ c: 1, h: 2, t: 1 }])).toBe(40);
    expect(computeMastery([{ c: 0, h: 0, t: 1 }])).toBe(0);
  });
  it('weights recent answers more', () => {
    const early = computeMastery([{ c: 0, h: 0, t: 1 }, { c: 1, h: 0, t: 1 }, { c: 1, h: 0, t: 1 }]);
    const late = computeMastery([{ c: 1, h: 0, t: 1 }, { c: 1, h: 0, t: 1 }, { c: 0, h: 0, t: 1 }]);
    expect(early).toBeGreaterThan(late);
  });
});

describe('status and spaced review', () => {
  const t0 = new Date('2026-03-02T10:00:00').getTime();
  it('needs 2+ separate days before Mastered', () => {
    let s: SkillState | undefined;
    for (let i = 0; i < 6; i++) s = applyAttempt(s, 's', att(true, t0 + i * 1000));
    expect(s!.mastery).toBe(100);
    expect(s!.status).toBe('getting');
    s = applyAttempt(s, 's', att(true, t0 + DAY));
    expect(s!.status).toBe('mastered');
    expect(s!.nextReview).toBe(t0 + DAY + REVIEW_DAYS[0] * DAY);
  });
  it('reviews at 3 -> 7 -> 21 days and drops back after a slip', () => {
    let s: SkillState | undefined;
    for (let i = 0; i < 5; i++) s = applyAttempt(s, 's', att(true, t0 + i * 1000));
    s = applyAttempt(s, 's', att(true, t0 + DAY));
    let at = s!.nextReview!;
    s = applyAttempt(s, 's', att(true, at));
    expect(s!.nextReview).toBe(at + 7 * DAY);
    at = s!.nextReview!;
    s = applyAttempt(s, 's', att(true, at));
    expect(s!.nextReview).toBe(at + 21 * DAY);
    s = applyAttempt(s, 's', att(false, at + 1000));
    expect(statusOf(s)).not.toBe('mastered');
    expect(s!.nextReview).toBe(at + 1000);
  });
  it('records error patterns with an example', () => {
    const s = applyAttempt(undefined, 's', { ...att(false, t0), errorTags: ['dig:sh'], expected: 'ship', given: 'sip' });
    expect(s.errors!['dig:sh']).toEqual({ n: 1, ex: 'ship→sip' });
  });
  it('is New until attempted', () => { expect(statusOf(blankState('x'))).toBe('new'); expect(statusOf(undefined)).toBe('new'); });
});

describe('placement binary search', () => {
  const n = ladder('reading').length;
  const run = (knows: number) => {
    const p = new Placement('reading');
    let qs = 0;
    while (!p.done) { p.submit(p.mid < knows); qs++; if (qs > 60) throw new Error('did not terminate'); }
    return { level: p.level, qs };
  };
  it('finds the right level for every possible child, in about 8-14 questions', () => {
    for (let knows = 0; knows <= n; knows++) {
      const { level, qs } = run(knows);
      expect(level).toBe(Math.min(knows, n - 1));
      expect(qs).toBeLessThanOrEqual(14);
      expect(qs).toBeGreaterThanOrEqual(6);
    }
  });
  it('uses a third question to break a split', () => {
    const p = new Placement('math');
    const first = p.mid;
    p.submit(true); p.submit(false);
    expect(p.mid).toBe(first);
    p.submit(true);
    expect(p.best).toBe(first);
  });
});

describe('what to serve next', () => {
  const L = ladder('reading');
  const allowed = APPS.find((a) => a.id === 'word-builder')!.skills;
  const placedStates = (upTo: number) => {
    const st: Record<string, SkillState> = {};
    for (let i = 0; i < upTo; i++) st[L[i].id] = { ...blankState(L[i].id), mastery: 75, placed: true, status: 'getting', nextReview: Date.now() + 5 * DAY, recent: [] };
    return st;
  };
  it('frontier starts at the placed level', () => {
    const p = profile({ levels: { reading: 5 } });
    expect(frontier(p, 'reading', placedStates(5)).id).toBe(L[5].id);
  });
  it('respects the parent cap', () => {
    const p = profile({ levels: { reading: 0 }, lockLevels: { reading: 2 } });
    const mastered: Record<string, SkillState> = {};
    for (let i = 0; i < 4; i++) mastered[L[i].id] = { ...blankState(L[i].id), mastery: 95, attempts: 9, days: ['a', 'b'], recent: Array(6).fill({ c: 1, h: 0, t: 1 }), status: 'mastered' };
    expect(frontier(p, 'reading', mastered).id).toBe(L[2].id);
  });
  it('mixes about 70% current, 20% review, 10% stretch', () => {
    const p = profile({ levels: { reading: 5 } });
    const states = placedStates(5);
    const rng = mulberry(7);
    const c = { current: 0, review: 0, stretch: 0, other: 0 };
    const N = 3000;
    for (let i = 0; i < N; i++) {
      const pk = pickSkill(p, 'reading', allowed, { rng, states });
      if (pk.bucket === 'current') c.current++; else if (pk.bucket === 'review') c.review++; else if (pk.bucket === 'stretch') c.stretch++; else c.other++;
      if (pk.bucket === 'current') expect(pk.skillId).toBe(L[5].id);
      if (pk.bucket === 'stretch') expect(pk.skillId).toBe(L[6].id);
      if (pk.bucket === 'review') expect(L.findIndex((s) => s.id === pk.skillId)).toBeLessThan(5);
    }
    expect(c.current / N).toBeGreaterThan(0.65); expect(c.current / N).toBeLessThan(0.75);
    expect(c.review / N).toBeGreaterThan(0.15); expect(c.review / N).toBeLessThan(0.25);
    expect(c.stretch / N).toBeGreaterThan(0.06); expect(c.stretch / N).toBeLessThan(0.14);
  });
  it('serves a confidence builder to a frustrated child', () => {
    const p = profile({ levels: { reading: 5 } });
    const pk = pickSkill(p, 'reading', allowed, { frustrated: true, states: placedStates(5) });
    expect(pk.bucket).toBe('confidence');
    expect(L.findIndex((s) => s.id === pk.skillId)).toBeLessThan(5);
  });
  it('gives pinned skills a share of practice', () => {
    const p = profile({ levels: { reading: 5 }, focusSkills: [L[7].id] });
    const rng = mulberry(3);
    let focus = 0;
    for (let i = 0; i < 1000; i++) if (pickSkill(p, 'reading', allowed, { rng, states: placedStates(5) }).bucket === 'focus') focus++;
    expect(focus).toBeGreaterThan(220); expect(focus).toBeLessThan(380);
  });
  it('starts with more support when mastery is low', () => {
    expect(baseDifficulty('x', {})).toBe(1);
    expect(baseDifficulty('x', { x: { ...blankState('x'), attempts: 4, mastery: 30 } })).toBe(0);
    expect(baseDifficulty('x', { x: { ...blankState('x'), attempts: 4, mastery: 90 } })).toBe(2);
  });
});

describe('in-session tracker', () => {
  it('3 right in a row = harder; 2 wrong = easier plus a proactive hint', () => {
    const t = new Tracker();
    t.record(true, 1000); t.record(true, 1000); t.record(true, 1000);
    expect(t.difficulty(1)).toBe(2);
    t.record(false, 1000); expect(t.proactiveHint).toBe(false);
    t.record(false, 1000);
    expect(t.proactiveHint).toBe(true);
    expect(t.difficulty(1)).toBe(1); // the earlier step up is cancelled
    expect(t.frustrated).toBe(false);
    t.record(false, 1000);
    expect(t.frustrated).toBe(true);
    expect(t.difficulty(1)).toBe(0);
    t.record(true, 1000);
    expect(t.frustrated).toBe(false);
  });
  it('long stalls trip the frustration guard', () => {
    const t = new Tracker();
    t.record(true, 40_000); t.record(true, 40_000);
    expect(t.frustrated).toBe(true);
  });
});

describe('missions', () => {
  it('builds 5 activities: reading, math, reading/story, math, game', () => {
    const plan = buildMission(profile(), APPS, mulberry(1));
    expect(plan).toHaveLength(5);
    const subj = plan.map((id) => APPS.find((a) => a.id === id)!.subject);
    expect(subj[0]).toBe('reading'); expect(subj[1]).toBe('math'); expect(subj[3]).toBe('math'); expect(subj[4]).toBe('games');
  });
  it('skips activities a parent turned off', () => {
    const off = APPS.filter((a) => a.subject === 'games').map((a) => a.id);
    const plan = buildMission(profile({ settings: { ...profile().settings, disabledApps: off } }), APPS, mulberry(2));
    expect(plan.every((id) => !off.includes(id))).toBe(true);
  });
});
