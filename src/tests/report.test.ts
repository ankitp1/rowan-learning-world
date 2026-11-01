import { describe, expect, it } from 'vitest';
import { createProfile } from '../core/db';
import { applyPlacement, logAttempt, statesOf } from '../core/engine';
import { buildReport, reportText } from '../core/report';
import { getDB } from '../core/db';

describe('captain\'s report', () => {
  const p = createProfile('Rowan', '🧒', 'pirate');
  const now = Date.now();
  const log = (skill: string, correct: boolean, o: { hints?: number; tags?: string[]; exp?: string; got?: string; at?: number } = {}) =>
    logAttempt(p.id, {
      skillIds: [skill], appId: 'word-builder', correct, hintsUsed: o.hints ?? 0, ms: 4000, at: o.at ?? now,
      errorTags: o.tags, expected: o.exp, given: o.got,
    });

  it('summarises strengths, trouble spots, patterns and hint hotspots', () => {
    for (let i = 0; i < 6; i++) log('read.cvc.a', true, { at: now - i * 1000 });
    for (let i = 0; i < 4; i++) log('read.dig.sh', false, { tags: ['dig:sh'], exp: 'ship', got: 'sip', hints: 2 });
    log('read.dig.sh', true, { hints: 1 });
    for (let i = 0; i < 4; i++) log('math.sub.10', i < 1, { tags: i < 1 ? undefined : ['math:add-for-sub'] });

    const r = buildReport(getDB().profiles.find((x) => x.id === p.id)!, { key: '7d' });
    expect(r.totalAttempts).toBe(6 + 5 + 4);
    expect(r.strengths.map((s) => s.skillId)).toContain('read.cvc.a');
    expect(r.needsHelp.map((s) => s.skillId)).toContain('read.dig.sh');
    expect(r.patterns.some((x) => x.text.includes('ship read as sip'))).toBe(true);
    expect(r.patterns.some((x) => x.text.includes('adds when asked to take away'))).toBe(true);
    expect(r.hotspots[0].name).toMatch(/sh words/);
    expect(r.summary).toContain('Rowan');
    expect(r.table.length).toBeGreaterThan(20);
    expect(reportText(getDB().profiles[0], r)).toContain('Needs extra help');
  });

  it('works for any period, including an empty one', () => {
    const prof = getDB().profiles.find((x) => x.id === p.id)!;
    expect(buildReport(prof, { key: 'custom', from: '2000-01-01', to: '2000-01-02' }).totalAttempts).toBe(0);
    expect(buildReport(prof, { key: 'today' }).totalAttempts).toBeGreaterThan(0);
    expect(buildReport(prof, { key: 'session' }).totalAttempts).toBeGreaterThan(0);
  });

  it('placement seeds earlier skills as reviewable', () => {
    const q = createProfile('Ava', '👧', 'super');
    applyPlacement(q.id, 'reading', 5);
    const st = statesOf(q.id);
    expect(Object.keys(st)).toHaveLength(5);
    expect(st['read.cvc.a'].placed).toBe(true);
    expect(getDB().profiles.find((x) => x.id === q.id)!.levels.reading).toBe(5);
  });
});
