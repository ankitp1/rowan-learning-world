// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import {
  WEEKLY_ROUTINES,
  ALL_VOYAGE_APPS,
  getTodayRoutine,
  isVoyageUnlocked,
  unlockVoyageToday,
  relockVoyageToday,
  clearVoyageStorage,
  recordVoyageTrackPick,
  getTrackNudge,
} from '../core/voyage';
import {
  getTodayQuest,
  isQuestDoneToday,
  markQuestDoneToday,
  REAL_WORLD_QUESTS,
} from '../core/realWorldQuests';

describe('Daily Voyage and Weekly Routine System', () => {
  beforeEach(() => {
    clearVoyageStorage();
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.clear === 'function') {
        window.localStorage.clear();
      }
    } catch {
      // ignore
    }
  });

  it('defines consistent routines for weekdays and unstructured free-choice for Fri, Sat, Sun', () => {
    expect(WEEKLY_ROUTINES).toHaveLength(7);
    expect(ALL_VOYAGE_APPS).toHaveLength(10);

    // Sunday (0) - Free Choice Weekend
    const sun = getTodayRoutine(0);
    expect(sun.dayName).toBe('Sunday');
    expect(sun.isFreeChoice).toBe(true);

    // Monday (1) - Structured
    const mon = getTodayRoutine(1);
    expect(mon.dayName).toBe('Monday');
    expect(mon.title).toBe('Word & Coin Monday');
    expect(mon.isFreeChoice).toBeFalsy();
    expect(mon.reading.appId).toBe('word-builder');
    expect(mon.math.appId).toBe('coin-count');

    // Tuesday (2) - Structured
    const tue = getTodayRoutine(2);
    expect(tue.dayName).toBe('Tuesday');
    expect(tue.title).toBe('Rhyme & Bridge Tuesday');
    expect(tue.isFreeChoice).toBeFalsy();
    expect(tue.reading.appId).toBe('rhyme-ropes');
    expect(tue.math.appId).toBe('number-bridge');

    // Wednesday (3) - Structured
    const wed = getTodayRoutine(3);
    expect(wed.dayName).toBe('Wednesday');
    expect(wed.title).toBe('Plank & Treasure Wednesday');
    expect(wed.isFreeChoice).toBeFalsy();
    expect(wed.reading.appId).toBe('blend-plank');
    expect(wed.math.appId).toBe('treasure-add');

    // Thursday (4) - Structured
    const thu = getTodayRoutine(4);
    expect(thu.dayName).toBe('Thursday');
    expect(thu.title).toBe('Sight & Subtract Thursday');
    expect(thu.isFreeChoice).toBeFalsy();
    expect(thu.reading.appId).toBe('sight-cannon');
    expect(thu.math.appId).toBe('sneaky-thief');

    // Friday (5) - Free Choice Weekend
    const fri = getTodayRoutine(5);
    expect(fri.dayName).toBe('Friday');
    expect(fri.isFreeChoice).toBe(true);

    // Saturday (6) - Free Choice Weekend
    const sat = getTodayRoutine(6);
    expect(sat.dayName).toBe('Saturday');
    expect(sat.isFreeChoice).toBe(true);
  });

  it('defaults to locked state before voyage completion', () => {
    expect(isVoyageUnlocked('p1', '2026-11-22')).toBe(false);
  });

  it('unlocks games island for today and dispatches event', () => {
    let eventFired = false;
    const handler = () => { eventFired = true; };
    window.addEventListener('voyage:unlocked', handler);

    unlockVoyageToday('p1', '2026-11-22');
    expect(isVoyageUnlocked('p1', '2026-11-22')).toBe(true);
    // Device level unlock ensures another profile on same device is also unlocked
    expect(isVoyageUnlocked('p2', '2026-11-22')).toBe(true);
    expect(eventFired).toBe(true);

    window.removeEventListener('voyage:unlocked', handler);
  });

  it('can be relocked by a parent', () => {
    unlockVoyageToday('p1', '2026-11-22');
    expect(isVoyageUnlocked('p1', '2026-11-22')).toBe(true);

    relockVoyageToday('p1', '2026-11-22');
    expect(isVoyageUnlocked('p1', '2026-11-22')).toBe(false);
  });

  it('nudges alternate track when child repeatedly picks the same subject', () => {
    // No picks yet
    expect(getTrackNudge('p1')).toBeNull();

    // 1 pick of math
    recordVoyageTrackPick('p1', 'math');
    expect(getTrackNudge('p1')).toBeNull();

    // 2 consecutive picks of math -> nudges reading
    recordVoyageTrackPick('p1', 'math');
    const readingNudge = getTrackNudge('p1');
    expect(readingNudge?.recommendedTrack).toBe('reading');
    expect(readingNudge?.reason).toContain('Math Master');

    // 2 consecutive picks of reading -> nudges math
    recordVoyageTrackPick('p1', 'reading');
    recordVoyageTrackPick('p1', 'reading');
    const mathNudge = getTrackNudge('p1');
    expect(mathNudge?.recommendedTrack).toBe('math');
    expect(mathNudge?.reason).toContain('Reading Champion');
  });

  it('provides rich real-world quests with completion tracking', () => {
    expect(REAL_WORLD_QUESTS.length).toBeGreaterThanOrEqual(70);
    const q = getTodayQuest();
    expect(q.prompt).toBeTruthy();
    expect(q.examples).toBeTruthy();

    expect(isQuestDoneToday('p1', '2026-11-22')).toBe(false);
    markQuestDoneToday('p1', '2026-11-22');
    expect(isQuestDoneToday('p1', '2026-11-22')).toBe(true);
  });
});
