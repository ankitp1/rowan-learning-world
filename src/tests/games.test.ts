import { describe, expect, it } from 'vitest';
import { absentGem, codeSpec, makeSecret, score } from '../apps/codeBreaker';
import { canMove, disksFor, isWon, move, optimalMoves, solve, startState, topDisk } from '../apps/hanoi';
import { gridFor, isMatch, makeDeck } from '../apps/memory';
import { makeRound, roundSpec } from '../apps/missing';
import { GROUPS, PLURALS } from '../content/groups';
import { followQuestion, makeQuestion, rhymeQuestion, rimeOf } from '../content/generators';
import { buildMission } from '../core/engine';
import { APPS } from '../core/registry';
import type { Profile } from '../core/types';

describe('code breaker', () => {
  it('scores like Mastermind, counting each gem once', () => {
    expect(score([0, 1, 2], [0, 1, 2])).toEqual({ exact: 3, near: 0 });
    expect(score([0, 1, 2], [2, 0, 1])).toEqual({ exact: 0, near: 3 });
    expect(score([0, 1, 2], [0, 2, 3])).toEqual({ exact: 1, near: 1 });
    expect(score([0, 0, 1, 2], [0, 1, 0, 0])).toEqual({ exact: 1, near: 2 });
    expect(score([1, 1, 2, 2], [1, 1, 1, 1])).toEqual({ exact: 2, near: 0 });
  });
  it('makes legal secrets for every level', () => {
    for (let lvl = 0; lvl < 8; lvl++) {
      const { len, colors, repeats } = codeSpec(lvl);
      for (let i = 0; i < 50; i++) {
        const s = makeSecret(len, colors, repeats);
        expect(s).toHaveLength(len);
        expect(s.every((g) => g >= 0 && g < colors)).toBe(true);
        if (!repeats) expect(new Set(s).size).toBe(len);
      }
    }
  });
  it('is solvable within the try limit by a consistent-guess strategy (so the limit is fair)', () => {
    for (const lvl of [0, 2, 3, 5]) {
      const { len, colors, repeats, maxTries } = codeSpec(lvl);
      const all: number[][] = [];
      const gen = (p: number[]) => { if (p.length === len) { all.push(p); return; } for (let c = 0; c < colors; c++) if (repeats || !p.includes(c)) gen([...p, c]); };
      gen([]);
      for (let rep = 0; rep < 5; rep++) {
        const secret = makeSecret(len, colors, repeats);
        let cands = all;
        let tries = 0;
        while (tries < maxTries) {
          const g = cands[0];
          tries++;
          const sc = score(secret, g);
          if (sc.exact === len) break;
          cands = cands.filter((c) => { const t = score(c, g); return t.exact === sc.exact && t.near === sc.near; });
        }
        expect(tries).toBeLessThan(maxTries);
      }
    }
  });
  it('finds a gem that is not in the code', () => { expect(absentGem([0, 1, 2], 4)).toBe(3); expect(absentGem([0, 1, 2, 3], 4)).toBeUndefined(); });
});

describe('tower puzzle', () => {
  it('enforces the rules', () => {
    let s = startState(3);
    expect(topDisk(s, 0)).toBe(0);
    expect(canMove(s, 1, 2)).toBe(false);
    s = move(s, 0, 1);
    expect(canMove(s, 0, 1)).toBe(false);
    expect(canMove(s, 0, 2)).toBe(true);
    expect(move(s, 0, 1)).toEqual(s);
  });
  it('solves from the start in exactly 2^n - 1 moves for every size', () => {
    for (let lvl = 0; lvl <= 4; lvl++) {
      const n = disksFor(lvl);
      let s = startState(n);
      const path = solve(s);
      expect(path).toHaveLength(optimalMoves(n));
      for (const m of path) { expect(canMove(s, m.from, m.to)).toBe(true); s = move(s, m.from, m.to); }
      expect(isWon(s)).toBe(true);
    }
  });
  it('finds the way out from a messy position', () => {
    let s = startState(4);
    for (const [f, t] of [[0, 1], [0, 2], [1, 2], [0, 1]]) s = move(s, f, t);
    const path = solve(s);
    expect(path.length).toBeLessThan(optimalMoves(4));
    for (const m of path) s = move(s, m.from, m.to);
    expect(isWon(s)).toBe(true);
  });
  it('caps at 7 disks', () => { expect(disksFor(0)).toBe(3); expect(disksFor(99)).toBe(7); });
});

describe('memory match', () => {
  it('builds decks with the right size and pairs for every mode and level', () => {
    for (const mode of ['pictures', 'letters', 'numbers'] as const) {
      for (let lvl = 0; lvl <= 5; lvl++) {
        const { rows, cols, pairs } = gridFor(lvl);
        const deck = makeDeck(mode, pairs);
        expect(deck).toHaveLength(rows * cols);
        expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
        const by = new Map<string, number>();
        deck.forEach((c) => by.set(c.pair, (by.get(c.pair) ?? 0) + 1));
        expect([...by.values()].every((n) => n === 2)).toBe(true);
      }
    }
  });
  it('letters pair with a picture that starts with that letter; numbers pair with that many dots', () => {
    for (const c of makeDeck('letters', 9).filter((x) => x.kind === 'emoji')) expect(c.word![0]).toBe(c.pair);
    for (const c of makeDeck('numbers', 12).filter((x) => x.kind === 'dots')) expect(String(c.value)).toBe(c.pair);
  });
  it('matches only the true partner', () => {
    const deck = makeDeck('pictures', 3);
    const a = deck[0];
    const partner = deck.find((c) => c.id !== a.id && c.pair === a.pair)!;
    const other = deck.find((c) => c.pair !== a.pair)!;
    expect(isMatch(a, a)).toBe(false);
    expect(isMatch(a, partner)).toBe(true);
    expect(isMatch(a, other)).toBe(false);
  });
  it('grids always hold an even number of cards', () => { for (let l = 0; l < 8; l++) expect((gridFor(l).rows * gridFor(l).cols) % 2).toBe(0); });
});

describe("what's missing", () => {
  it('always offers the missing items plus decoys that were never shown', () => {
    for (let lvl = 0; lvl <= 8; lvl++) for (let i = 0; i < 30; i++) {
      const r = makeRound(lvl);
      const spec = roundSpec(lvl);
      expect(r.items).toHaveLength(spec.count);
      expect(new Set(r.items).size).toBe(r.items.length);
      expect(r.missing).toHaveLength(spec.missing);
      const gone = r.missing.map((m) => r.items[m]);
      expect(gone.every((g) => r.options.includes(g))).toBe(true);
      expect(r.options.filter((o) => !gone.includes(o)).every((o) => !r.items.includes(o))).toBe(true);
      expect(new Set(r.options).size).toBe(r.options.length);
    }
  });
  it('gets harder: more items, two missing, less study time', () => {
    expect(roundSpec(0)).toMatchObject({ count: 4, missing: 1, study: 9 });
    expect(roundSpec(3).missing).toBe(2);
    expect(roundSpec(9).count).toBe(10);
    expect(roundSpec(20).study).toBe(3);
  });
});

describe('rhyme and directions questions', () => {
  it('rhyme: the answer shares the ending, the distractors do not', () => {
    for (let i = 0; i < 200; i++) {
      const q = rhymeQuestion('read.rhyme', { difficulty: (i % 3) as 0 | 1 | 2 });
      expect(rimeOf(q.answer)).toBe(rimeOf(q.word!));
      expect(q.answer).not.toBe(q.word);
      for (const c of q.choices.filter((x) => x.id !== q.answer)) expect(rimeOf(c.id)).not.toBe(rimeOf(q.word!));
      expect(q.choices).toHaveLength(3);
      expect(new Set(q.choices.map((c) => c.emoji)).size).toBe(3);
    }
  });
  it('directions: exactly one shape matches what the sentence says', () => {
    const hex: Record<string, string> = { red: '#e63946', blue: '#2f7fe0', green: '#2a9d4a', yellow: '#ffc933' };
    for (let i = 0; i < 300; i++) {
      const d = (i % 3) as 0 | 1 | 2;
      const q = followQuestion('read.comp.follow', { difficulty: d });
      const m = q.prompt.match(/^Tap the (?:(big|small) )?(?:(red|blue|green|yellow) )?(circle|square|triangle|star|shape)\.$/)!;
      expect(m).toBeTruthy();
      const matches = q.choices.filter((c) => (!m[1] || c.shape!.big === (m[1] === 'big')) && (!m[2] || c.shape!.color === hex[m[2]]) && (m[3] === 'shape' || c.shape!.kind === m[3]));
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe(q.answer);
      expect(q.silent).toBe(true);
      expect(q.choices.length).toBe(d === 0 ? 4 : d === 1 ? 5 : 6);
      for (const c of q.choices.filter((x) => x.id !== q.answer)) expect(c.tags!.length).toBeGreaterThan(0);
    }
  });
  it('dispatches to the new generators', () => {
    expect(makeQuestion('read.rhyme').kind).toBe('rhyme');
    expect(makeQuestion('read.comp.follow').kind).toBe('follow');
  });
});

describe('missions with the new games', () => {
  const prof = (): Profile => ({
    id: 'p', name: 'R', avatar: '🧒', themeId: 'pirate', levels: {}, focusSkills: [], placementDone: true, stars: 0, stickers: [],
    settings: { dailyMinutes: 0, hintMode: 'full', speechRate: 1, allowedThemes: [], disabledApps: [] }, createdAt: 0,
  });
  it('brain games can be the finale and extras add reading variety', () => {
    const games = new Set<string>();
    const slot3 = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const plan = buildMission(prof(), APPS);
      expect(plan).toHaveLength(5);
      games.add(plan[4]); slot3.add(plan[2]);
    }
    expect(games.size).toBeGreaterThanOrEqual(5);
    expect(['rhyme-ropes', 'captains-log', 'mystery-story'].every((id) => slot3.has(id))).toBe(true);
  });
  it('number bridge only appears when make-10 is what he is working on', () => {
    const early = new Set<string>();
    for (let i = 0; i < 100; i++) buildMission(prof(), APPS).forEach((id) => early.add(id));
    expect(early.has('number-bridge')).toBe(false);
    const late: Profile = { ...prof(), levels: { math: 7 } };
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) buildMission(late, APPS).forEach((id) => seen.add(id));
    expect(seen.has('number-bridge')).toBe(true);
  });
});

describe('group names', () => {
  it('always has exactly one correct answer, unique choices, and no accidental correct distractors', () => {
    for (const d of [0, 1, 2] as const) {
      for (let i = 0; i < 200; i++) {
        const q = makeQuestion('read.groups', { difficulty: d });
        expect(q.kind).toBe('group');
        const ids = q.choices.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids).toContain(q.answer);
        expect(q.choices.length).toBeGreaterThanOrEqual(2);
        if (q.b === 0) {
          const item = GROUPS.find((g) => g.noun === q.word)!;
          expect(ids.filter((x) => item.ok.includes(x))).toEqual([q.answer]);
        } else {
          const p = PLURALS.find((x) => x.one === q.word)!;
          expect(q.answer).toBe(p.many);
        }
        for (const c of q.choices) if (c.id !== q.answer) expect(c.tags?.[0]).toMatch(/^(group|plural):/);
      }
    }
  });

  it('easy level only uses everyday items', () => {
    for (let i = 0; i < 100; i++) {
      const q = makeQuestion('read.groups', { difficulty: 0 });
      const lvl = q.b === 1 ? PLURALS.find((x) => x.one === q.word)!.lvl : GROUPS.find((g) => g.noun === q.word)!.lvl;
      expect(lvl).toBe(0);
    }
  });
});
