// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import {
  WEEKLY_ROUTINES,
  getTodayRoutine,
  isVoyageUnlocked,
  unlockVoyageToday,
  relockVoyageToday,
  clearVoyageStorage,
} from '../core/voyage';

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

  it('defines consistent routines for all 7 days of the week', () => {
    expect(WEEKLY_ROUTINES).toHaveLength(7);

    // Sunday (0)
    const sun = getTodayRoutine(0);
    expect(sun.dayName).toBe('Sunday');
    expect(sun.reading.appId).toBe('word-builder');
    expect(sun.math.appId).toBe('treasure-add');

    // Monday (1)
    const mon = getTodayRoutine(1);
    expect(mon.dayName).toBe('Monday');
    expect(mon.title).toBe('Word & Coin Monday');
    expect(mon.reading.appId).toBe('word-builder');
    expect(mon.math.appId).toBe('coin-count');

    // Tuesday (2)
    const tue = getTodayRoutine(2);
    expect(tue.dayName).toBe('Tuesday');
    expect(tue.reading.appId).toBe('rhyme-ropes');
    expect(tue.math.appId).toBe('number-bridge');

    // Wednesday (3)
    const wed = getTodayRoutine(3);
    expect(wed.dayName).toBe('Wednesday');
    expect(wed.reading.appId).toBe('blend-plank');
    expect(wed.math.appId).toBe('treasure-add');

    // Thursday (4)
    const thu = getTodayRoutine(4);
    expect(thu.dayName).toBe('Thursday');
    expect(thu.reading.appId).toBe('sight-cannon');
    expect(thu.math.appId).toBe('sneaky-thief');

    // Friday (5)
    const fri = getTodayRoutine(5);
    expect(fri.dayName).toBe('Friday');
    expect(fri.reading.appId).toBe('captains-log');
    expect(fri.math.appId).toBe('coin-count');

    // Saturday (6)
    const sat = getTodayRoutine(6);
    expect(sat.dayName).toBe('Saturday');
    expect(sat.reading.appId).toBe('blend-plank');
    expect(sat.math.appId).toBe('number-bridge');
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
});
