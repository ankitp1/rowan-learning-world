import { describe, expect, it } from 'vitest';
import { createProfile, deleteProfile, getDB, logAttemptForTest, patchProfile, resetAll, setGameLevel, update } from './syncTestHelpers';
import { applyPlacement, resetSkill } from '../core/engine';
import { mergeDB } from '../core/sync';

describe('cross-device conflict-free merge (mergeDB)', () => {
  it('merges attempts from two devices, deduplicates, and recomputes skill mastery', () => {
    resetAll();
    const p = createProfile('Rowan', '🧒', 'pirate');
    const t0 = 1_700_000_000_000;

    // Shared baseline attempt
    logAttemptForTest(p.id, { skillIds: ['read.cvc.a'], appId: 'word-builder', correct: true, hintsUsed: 0, ms: 2000, at: t0 });
    const base = structuredClone(getDB());

    // Device A (Phone): 3 more correct answers on day 1, plus 2 stars and sticker
    const devA = structuredClone(base);
    devA.profiles[0].stars = 5;
    devA.profiles[0].stickers = ['🦜'];
    devA.attempts[p.id].push(
      { skillIds: ['read.cvc.a'], appId: 'word-builder', correct: true, hintsUsed: 0, ms: 1800, at: t0 + 1000 },
      { skillIds: ['read.cvc.a'], appId: 'word-builder', correct: true, hintsUsed: 0, ms: 1800, at: t0 + 2000 },
      { skillIds: ['read.cvc.a'], appId: 'word-builder', correct: true, hintsUsed: 0, ms: 1800, at: t0 + 3000 },
    );

    // Device B (TV): 2 correct answers on day 2, plus different sticker and higher stars
    const devB = structuredClone(base);
    devB.profiles[0].stars = 8;
    devB.profiles[0].stickers = ['🏴‍☠️'];
    devB.attempts[p.id].push(
      { skillIds: ['read.cvc.a'], appId: 'blend-plank', correct: true, hintsUsed: 0, ms: 1900, at: t0 + 86_400_000 },
      { skillIds: ['read.cvc.a'], appId: 'blend-plank', correct: true, hintsUsed: 0, ms: 1900, at: t0 + 86_401_000 },
    );

    const merged = mergeDB(devA, devB);
    expect(merged.attempts[p.id]).toHaveLength(6); // 1 shared + 3 from A + 2 from B
    expect(merged.skills[p.id]['read.cvc.a'].mastery).toBe(100);
    expect(merged.skills[p.id]['read.cvc.a'].status).toBe('mastered'); // 6 clean attempts across 2 separate days!
    expect(merged.profiles[0].stars).toBe(8);
    expect(merged.profiles[0].stickers.sort()).toEqual(['🏴‍☠️', '🦜'].sort());
  });

  it('sums daily playtime across distinct devices without double-counting repeated syncs', () => {
    resetAll();
    const p = createProfile('Rowan', '🧒', 'pirate');
    const day = '2026-11-01';

    const devA = structuredClone(getDB());
    devA.devicePlaytime = { [p.id]: { [day]: { dev_phone: 600_000 } } };
    devA.playtime = { [p.id]: { [day]: 600_000 } };

    const devB = structuredClone(getDB());
    devB.devicePlaytime = { [p.id]: { [day]: { dev_phone: 300_000, dev_tv: 900_000 } } };
    devB.playtime = { [p.id]: { [day]: 1_200_000 } };

    const merged = mergeDB(devA, devB);
    // dev_phone max(600k, 300k) = 600k + dev_tv 900k = 1,500,000 ms (25 min)
    expect(merged.playtime[p.id][day]).toBe(1_500_000);
    // Syncing again with devA is idempotent
    expect(mergeDB(merged, devA).playtime[p.id][day]).toBe(1_500_000);
  });

  it('syncs game levels monotonically and respects profile deletion tombstones and skill resets', () => {
    resetAll();
    const p1 = createProfile('Rowan', '🧒', 'pirate');
    const p2 = createProfile('Ava', '👧', 'super');
    applyPlacement(p1.id, 'reading', 3);
    setGameLevel(`rlw.maze.${p1.id}`, 4);

    const staleRemote = structuredClone(getDB());
    staleRemote.gameLevels![`rlw.maze.${p1.id}`] = 2;

    // Delete p2 and reset reading rung 0 on local
    deleteProfile(p2.id);
    resetSkill(p1.id, 'read.cvc.a');
    patchProfile(p1.id, (x) => { x.themeId = 'super'; });

    const merged = mergeDB(getDB(), staleRemote);
    expect(merged.profiles.map((x) => x.id)).toEqual([p1.id]); // p2 stays deleted
    expect(merged.gameLevels![`rlw.maze.${p1.id}`]).toBe(4); // higher maze level kept
    expect(merged.skills[p1.id]['read.cvc.a']).toBeUndefined(); // reset skill stays reset
    expect(merged.profiles[0].themeId).toBe('super'); // newer profile setting wins
  });
});

export { update };
