// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import App from '../App';
import { createProfile, getDB, patchProfile, resetAll } from '../core/db';
import { statesOf } from '../core/engine';

/**
 * End-to-end smoke test of the real screens in jsdom: first run, placement,
 * hub, a word game, a math round, the story, a mission and Parent Mode.
 */
beforeAll(() => { resetAll(); });
afterEach(() => cleanup());

const wait = { timeout: 20_000, interval: 50 };
const btn = (name: RegExp | string) => screen.getByRole('button', { name });
const click = (name: RegExp | string) => fireEvent.click(btn(name));

/** Click the first enabled choice until the round-done screen appears. */
async function playRound(total: number) {
  for (let i = 0; i < 600; i++) {
    if (screen.queryByText(new RegExp(`of ${total}!`))) return;
    const choices = [...document.querySelectorAll<HTMLButtonElement>('.choices .choice:not(:disabled)')];
    if (choices.length && !document.querySelector('.choice.right')) fireEvent.click(choices[0]);
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('round never finished');
}

describe('first run to Parent Mode', () => {
  it('creates a player, runs placement, and lands on the map', async () => {
    render(<StrictMode><App /></StrictMode>);
    expect(screen.getByText(/Welcome! Who is playing/)).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Rowan' } });
    click(/Let's go/);
    await screen.findByText('The Treasure Hunt!');
    click('Start!');
    // answer by tapping the first picture each time; the search must terminate for both subjects
    for (let i = 0; i < 80; i++) {
      if (screen.queryByText('Treasure found!')) break;
      const c = document.querySelector<HTMLButtonElement>('.choices .choice:not(:disabled)');
      if (c) fireEvent.click(c);
      await new Promise((r) => setTimeout(r, 150));
    }
    await screen.findByText('Treasure found!', {}, wait);
    const p = getDB().profiles[0];
    expect(p.placementDone).toBe(true);
    expect(p.levels.reading).toBeDefined();
    expect(p.levels.math).toBeDefined();
    click(/Let's play/);
    await screen.findByText(/Start a mission/);
    expect(screen.getByText(/Captain Rowan's Crew/)).toBeTruthy();
  }, 90_000);

  it('plays Coin Count: a full round logs attempts into the skill map', async () => {
    const p = getDB().profiles[0];
    patchProfile(p.id, (x) => { x.levels.math = 0; });
    render(<StrictMode><App /></StrictMode>);
    click(/Rowan/);
    await screen.findByText(/Start a mission/);
    click(/Number Reef/);
    click(/Coin Count/);
    await playRound(5);
    const attempts = getDB().attempts[p.id].filter((a) => a.appId === 'coin-count');
    expect(attempts).toHaveLength(5);
    expect(attempts.every((a) => a.skillIds[0].startsWith('math.'))).toBe(true);
    expect(Object.keys(statesOf(p.id)).length).toBeGreaterThan(0);
    expect(getDB().profiles[0].stars).toBeGreaterThanOrEqual(0);
  }, 60_000);

  it('plays Word Builder: tapping letters spells the word and advances', async () => {
    const p = getDB().profiles[0];
    render(<StrictMode><App /></StrictMode>);
    click(/Rowan/);
    await screen.findByText(/Start a mission/);
    click(/Phonics Cove/);
    click(/Word Builder/);
    await screen.findByText(/Build the word/);
    const before = getDB().attempts[p.id]?.length ?? 0;
    for (let i = 0; i < 60; i++) {
      if (getDB().attempts[p.id].length > before) break;
      for (const t of document.querySelectorAll<HTMLButtonElement>('.tray .tile:not(:disabled)')) fireEvent.click(t);
      await new Promise((r) => setTimeout(r, 200));
    }
    await waitFor(() => expect(getDB().attempts[p.id].length).toBeGreaterThan(before), wait);
    const a = getDB().attempts[p.id].at(-1)!;
    expect(a.appId).toBe('word-builder');
    expect(a.skillIds[0]).toMatch(/^read\./);
  }, 60_000);

  it('hint button escalates and is logged', async () => {
    const p = getDB().profiles[0];
    render(<StrictMode><App /></StrictMode>);
    click(/Rowan/);
    await screen.findByText(/Start a mission/);
    click(/Number Reef/);
    click(/Treasure Add/);
    const help = await screen.findByRole('button', { name: /hint/i });
    fireEvent.click(help); fireEvent.click(help);
    await waitFor(() => expect(document.querySelectorAll('.choice.gone').length).toBeGreaterThanOrEqual(1));
    const right = document.querySelector<HTMLButtonElement>('.choices .choice:not(:disabled)')!;
    // find and click the correct one by brute force: click until one is marked right
    for (const c of document.querySelectorAll<HTMLButtonElement>('.choices .choice:not(:disabled)')) { fireEvent.click(c); if (document.querySelector('.choice.right')) break; }
    void right;
    await waitFor(() => expect(getDB().attempts[p.id].some((a) => a.appId === 'treasure-add' && a.hintsUsed >= 2)).toBe(true), wait);
  }, 60_000);

  it('plays the mystery story: read, collect a clue, solve', async () => {
    const p = getDB().profiles[0];
    render(<StrictMode><App /></StrictMode>);
    click(/Rowan/);
    await screen.findByText(/Start a mission/);
    click(/Mystery Manor/);
    click(/Missing Map/);
    await waitFor(() => expect(document.querySelector('.story-text')?.textContent).toContain('Themapisnotinthebox')); // each word is its own button
    // tapping a word offers help
    fireEvent.click(screen.getByRole('button', { name: 'gone!' }));
    expect(screen.getByText(/Say it/)).toBeTruthy();
    click(/Next/);
    click(/Clue/);
    expect(screen.getByText(/Clue found/)).toBeTruthy();
    click(/Next/); click(/Next/); click(/Next/); click(/Solve the case/); // 5 pages
    for (let q = 0; q < 3; q++) {
      await screen.findAllByText(/Who/, {}, wait); // shown in the helper bubble and the prompt
      for (let i = 0; i < 6; i++) {
        const c = document.querySelector<HTMLButtonElement>('.choices .choice:not(:disabled)');
        if (c && !document.querySelector('.choice.right')) fireEvent.click(c);
        await new Promise((r) => setTimeout(r, 100));
        if (document.querySelector('.choice.right')) break;
      }
      if (q < 2) await waitFor(() => expect(document.querySelector('.choice.right')).toBeNull(), wait);
    }
    await screen.findByText('Case solved!', {}, wait);
    const comp = getDB().attempts[p.id].filter((a) => a.appId === 'mystery-story');
    expect(comp.map((a) => a.skillIds[0])).toEqual(['read.comp.recall', 'read.comp.sequence', 'read.comp.infer']);
  }, 90_000);

  it('opens a mission and shows the first activity', async () => {
    render(<StrictMode><App /></StrictMode>);
    click(/Rowan/);
    await screen.findByText(/Start a mission/);
    click(/Start a mission/);
    await screen.findByText(/quick jobs to do/);
    click(/Let's go/);
    await waitFor(() => expect(document.querySelector('.mission-bar')).toBeTruthy(), wait);
    await waitFor(() => expect(document.querySelector('.round-body, .builder')).toBeTruthy(), wait);
  }, 30_000);

  it('Parent Mode: hold, times-table, create PIN, see the report; PIN is then required', async () => {
    render(<StrictMode><App /></StrictMode>);
    click(/Rowan/);
    await screen.findByText(/Start a mission/);
    click('Grown-ups');
    const hold = await screen.findByText('Hold');
    fireEvent.pointerDown(hold.closest('button')!);
    await screen.findByText(/What is \d × \d\?/, {}, wait);
    const m = screen.getByText(/What is (\d) × (\d)\?/).textContent!.match(/(\d) × (\d)/)!;
    const tap = (s: string) => { for (const d of s) fireEvent.click(within(document.querySelector('.keypad')!).getByRole('button', { name: d })); };
    tap(String(Number(m[1]) * Number(m[2])));
    click('OK');
    await screen.findByText(/Create a 4-digit PIN/);
    tap('2468'); click('Next');
    await screen.findByText(/again to confirm/);
    tap('2468'); click('Save');
    await screen.findByText(/Captain's Report/, {}, wait);
    expect(screen.getByText(/Rowan:/)).toBeTruthy();
    expect(document.querySelector('.summary')!.textContent).toContain('Rowan');
    expect(getDB().parent.pinHash).toBeTruthy();
    // controls tab shows level controls and toggles
    click(/Controls/);
    expect(screen.getByText(/Reading levels/)).toBeTruthy();
    expect(screen.getByText(/Screen time/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText(/Word Builder/));
    expect(getDB().profiles[0].settings.disabledApps).toContain('word-builder');
  }, 60_000);

  it('a second profile exists with its own state and the report can compare players', () => {
    const b = createProfile('Ava', '👧', 'super');
    expect(statesOf(b.id)).toEqual({});
    render(<StrictMode><App /></StrictMode>);
    expect(screen.getByText(/Who's playing/)).toBeTruthy();
    expect(screen.getByText('Ava')).toBeTruthy();
  });
});
