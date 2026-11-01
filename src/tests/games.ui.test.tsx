// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import App from '../App';
import { disksFor, solve, startState } from '../apps/hanoi';
import { createProfile, getDB, patchProfile, resetAll } from '../core/db';

/** Each new game opened directly (via the #play: debug hook) under React StrictMode, like `npm run dev`. */
let pid = '';
beforeAll(() => {
  resetAll();
  const p = createProfile('Rowan', '🧒', 'pirate');
  patchProfile(p.id, (x) => { x.placementDone = true; x.levels = { reading: 5, math: 7 }; });
  pid = p.id;
});
afterEach(() => cleanup());

const open = (hash: string) => { window.location.hash = hash; render(<StrictMode><App /></StrictMode>); };
const wait = { timeout: 15_000, interval: 50 };
const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));
const btn = (name: RegExp | string) => screen.getByRole('button', { name });

async function playRound(total: number) {
  for (let i = 0; i < 700; i++) {
    if (screen.queryByText(new RegExp(`of ${total}!`))) return;
    const c = [...document.querySelectorAll<HTMLButtonElement>('.choices .choice:not(:disabled)')];
    if (c.length && !document.querySelector('.choice.right')) fireEvent.click(c[0]);
    await tick(100);
  }
  throw new Error('round never finished');
}

describe('skill games', () => {
  it('Number Bonds Bridge: shows the bridge and finishes a round, logging make-10', async () => {
    open('#play:number-bridge');
    await waitFor(() => expect(document.querySelector('.bridge')).toBeTruthy(), wait);
    expect(document.querySelectorAll('.plank').length).toBeGreaterThanOrEqual(10);
    await playRound(5);
    const logged = getDB().attempts[pid].filter((a) => a.appId === 'number-bridge');
    expect(logged).toHaveLength(5);
    expect(logged.every((a) => a.skillIds[0] === 'math.make10')).toBe(true);
  }, 60_000);

  it('Rhyme Ropes: hanging cards, finishes a round, logs rhyming', async () => {
    open('#play:rhyme-ropes');
    await waitFor(() => expect(document.querySelector('.choices.ropes')).toBeTruthy(), wait);
    await playRound(5);
    expect(getDB().attempts[pid].filter((a) => a.appId === 'rhyme-ropes').every((a) => a.skillIds[0] === 'read.rhyme')).toBe(true);
  }, 60_000);

  it("Captain's Log: shapes, written directions are not read aloud, logs following directions", async () => {
    open('#play:captains-log');
    await waitFor(() => expect(document.querySelectorAll('.choices.deck .shape-svg').length).toBeGreaterThanOrEqual(3), wait);
    expect(document.querySelector('.prompt span')!.textContent).toMatch(/^Tap the /);
    await playRound(5);
    const rows = getDB().attempts[pid].filter((a) => a.appId === 'captains-log');
    expect(rows).toHaveLength(5);
    expect(rows.every((a) => a.skillIds[0] === 'read.comp.follow')).toBe(true);
  }, 60_000);
});

describe('logic games', () => {
  it('Code Breaker: fill a guess, get feedback, hints lock a gem', async () => {
    open('#play:code-breaker');
    await screen.findByText(/Crack the code/, {}, wait);
    const pal = [...document.querySelectorAll<HTMLButtonElement>('.gem-btn')];
    expect(pal.length).toBe(4); // level 0: 4 colours
    for (let i = 0; i < 3; i++) fireEvent.click(pal[i]);
    fireEvent.click(btn('Try it!'));
    await waitFor(() => expect(document.querySelectorAll('.code-history .code-row').length + (document.querySelector('.card') ? 1 : 0)).toBeGreaterThan(0), wait);
    const won = !!document.querySelector('.card');
    if (!won) {
      expect(document.querySelectorAll('.fb i').length).toBe(3);
      const help = btn(/hint/i);
      fireEvent.click(help); fireEvent.click(help); fireEvent.click(help);
      await waitFor(() => expect(document.querySelector('.slot-btn.locked')).toBeTruthy(), wait);
    }
  }, 60_000);

  it('Tower Puzzle: illegal moves are refused, and the solver path wins', async () => {
    open('#play:hanoi');
    const n = disksFor(0);
    await screen.findByText(/Move the whole tower/, {}, wait);
    const peg = (i: number) => document.querySelectorAll<HTMLButtonElement>('.hpeg')[i];
    // legal: smallest disk to peg 2; then illegal: next disk onto the smaller one
    fireEvent.click(peg(0)); fireEvent.click(peg(1));
    fireEvent.click(peg(0)); fireEvent.click(peg(1));
    await waitFor(() => expect(screen.getByText(/can't sit on a small one/)).toBeTruthy());
    expect(document.querySelector('.topbar .clues')!.textContent).toContain('1 moves');
    // undo, then play the optimal solution from scratch
    fireEvent.click(btn(/Start over/));
    for (const m of solve(startState(n))) { fireEvent.click(peg(m.from)); fireEvent.click(peg(m.to)); }
    await screen.findByText('Tower moved!', {}, wait);
    expect(screen.getAllByText(/fewest possible moves/).length).toBeGreaterThan(0);
    expect(getDB().profiles.find((p) => p.id === pid)!.stars).toBeGreaterThan(0);
  }, 60_000);
});

describe('memory games', () => {
  it('Memory Match: picks a mode, flips cards, finds every pair', async () => {
    open('#play:memory-match');
    fireEvent.click(await screen.findByRole('button', { name: /Picture pairs/ }));
    await waitFor(() => expect(document.querySelectorAll('.mcard').length).toBe(6), wait);
    // faces are always in the DOM (CSS hides them), so a "perfect player" can read them and click true pairs
    const cards = [...document.querySelectorAll<HTMLButtonElement>('.mcard')];
    const byFace = new Map<string, HTMLButtonElement[]>();
    for (const c of cards) {
      const k = c.querySelector('.mc-front')!.textContent!;
      byFace.set(k, [...(byFace.get(k) ?? []), c]);
    }
    // first make one deliberate mismatch and check it flips back
    const faces = [...byFace.values()];
    fireEvent.click(faces[0][0]); fireEvent.click(faces[1][0]);
    await waitFor(() => expect(document.querySelectorAll('.mcard.open').length).toBe(2));
    await waitFor(() => expect(document.querySelectorAll('.mcard.open').length).toBe(0), wait);
    for (const [, pair] of byFace) {
      fireEvent.click(pair[0]); fireEvent.click(pair[1]);
      await tick(700);
    }
    await screen.findByText('All matched!', {}, wait);
  }, 60_000);

  it('Echo Sequence: shows a pattern, accepts the right press, replays after a slip', async () => {
    open('#play:echo');
    const seen: number[] = [];
    const obs = new MutationObserver(() => {
      document.querySelectorAll('.echo-pad').forEach((el, i) => { if (el.classList.contains('lit') && seen[seen.length - 1] !== i + 1000 * seen.length) seen.push(i); });
    });
    await waitFor(() => expect(document.querySelectorAll('.echo-pad').length).toBe(4), wait);
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    await screen.findByText('Your turn!', {}, wait);
    obs.disconnect();
    expect(seen.length).toBeGreaterThanOrEqual(1);
    const pads = [...document.querySelectorAll<HTMLButtonElement>('.echo-pad')];
    const wrong = pads.findIndex((_, i) => i !== seen[0]);
    fireEvent.click(pads[wrong]);
    await screen.findByText(/Oops! Watch it again/, {}, wait);
    await screen.findByText('Your turn!', {}, wait);
    fireEvent.click(document.querySelectorAll<HTMLButtonElement>('.echo-pad')[seen[0]]);
    await screen.findByText(/Great! 1 in a row/, {}, wait);
  }, 60_000);

  it("What's Missing: study, cover, then find what disappeared", async () => {
    open('#play:whats-missing');
    await screen.findByText(/Look carefully/, {}, wait);
    fireEvent.click(btn(/I remember/));
    await waitFor(() => expect(document.querySelectorAll('.choices .choice').length).toBe(4), wait);
    expect(document.querySelector('.mitem.blank')).toBeTruthy();
    const opts = [...document.querySelectorAll<HTMLButtonElement>('.choices .choice')];
    expect(opts).toHaveLength(4); // 1 missing + 3 decoys at level 0
    for (const o of opts) { fireEvent.click(o); if (document.querySelector('.mitem.blank.got')) break; }
    await waitFor(() => expect(document.querySelector('.mitem.blank.got')).toBeTruthy(), wait);
  }, 60_000);
});

describe('group names UI', () => {
  it('Group Names: shows the picture, finishes a round, logs the skill', async () => {
    open('#play:group-names');
    await waitFor(() => expect(document.querySelector('.group-visual')).toBeTruthy(), wait);
    await playRound(5);
    const rows = getDB().attempts[pid].filter((a) => a.appId === 'group-names');
    expect(rows).toHaveLength(5);
    expect(rows.every((a) => a.skillIds[0] === 'read.groups')).toBe(true);
  }, 60_000);
});
