import { describe, expect, it } from 'vitest';
import words from '../content/words.json';
import { addQuestion, compareQuestion, countQuestion, diagnoseWord, make10Question, makeQuestion, sightQuestion, subQuestion, wordQuestion } from '../content/generators';
import { soundsOf, tilesOf } from '../content/phonics';
import { ladder } from '../core/skills';
import { aiMove, winner, winningMove, type Board } from '../apps/ttt';
import { generateMaze, reachable } from '../apps/mazeGen';
import { inBedtime, hashPin } from '../core/time';
import { describeTag } from '../core/report';

const sane = (q: ReturnType<typeof makeQuestion>) => {
  const ids = q.choices.map((c) => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.filter((i) => i === q.answer)).toHaveLength(1);
  expect(q.choices.length).toBeGreaterThanOrEqual(2);
  expect(q.hints).toHaveLength(3);
  expect(q.explain.text.length).toBeGreaterThan(3);
};

describe('phonics', () => {
  it('keeps digraphs together', () => {
    expect(tilesOf('ship')).toEqual(['sh', 'i', 'p']);
    expect(tilesOf('chick')).toEqual(['ch', 'i', 'ck']);
    expect(tilesOf('shell')).toEqual(['sh', 'e', 'll']);
    expect(tilesOf('frog')).toEqual(['f', 'r', 'o', 'g']);
  });
  it('silent e: long vowel, e not sounded', () => {
    expect(soundsOf('cake', true)).toEqual(['c', 'a_e', 'k']);
    expect(soundsOf('snake', true)).toEqual(['s', 'n', 'a_e', 'k']);
  });
  it('every word in the pack lives in the right skill', () => {
    const pack = words as Record<string, { w: string; e: string }[]>;
    const vowel: Record<string, string> = { a: 'a', i: 'i', o: 'o', e: 'e', u: 'u' };
    for (const [skill, list] of Object.entries(pack)) {
      expect(list.length).toBeGreaterThanOrEqual(5);
      for (const { w, e } of list) {
        expect(e).toBeTruthy();
        if (skill.startsWith('read.cvc.')) expect(w).toHaveLength(3), expect(w[1]).toBe(vowel[skill.split('.')[2]]);
        if (skill.startsWith('read.dig.')) expect(w).toContain(skill.split('.')[2]);
        if (skill === 'read.silent-e') expect(w.endsWith('e')).toBe(true);
      }
    }
  });
});

describe('error diagnosis', () => {
  it.each([
    ['ship', 'sip', 'dig:sh'], ['chip', 'cip', 'dig:ch'], ['bath', 'bat', 'dig:th'], ['cat', 'dog', 'begin'],
    ['bed', 'bad', 'vowel:a/e'], ['pig', 'pug', 'vowel:i/u'], ['dog', 'bog', 'rev:b/d'], ['dog', 'fog', 'begin'], ['bat', 'bad', 'end'],
    ['chip', 'ship', 'dig:swap'], ['bus', 'dus', 'rev:b/d'], ['pin', 'qin', 'rev:p/q'],
  ])('%s picked as %s -> %s', (exp, got, tag) => { expect(diagnoseWord(exp, got)).toBe(tag); });
  it('describes tags in plain English', () => {
    expect(describeTag('dig:sh', 'ship→sip')).toContain('ship read as sip');
    expect(describeTag('rev:b/d')).toContain('b and d');
    expect(describeTag('math:add-for-sub')).toContain('adds when asked to take away');
  });
});

describe('generators', () => {
  it('every ladder skill makes valid questions at every difficulty', () => {
    for (const subject of ['reading', 'math'] as const) {
      for (const sk of ladder(subject)) {
        for (const d of [0, 1, 2] as const) for (let i = 0; i < 25; i++) {
          const q = makeQuestion(sk.id, { difficulty: d });
          expect(q.skill).toBe(sk.id);
          sane(q);
        }
      }
    }
  });
  it('word questions have a picture answer and tag distractors', () => {
    for (let i = 0; i < 50; i++) {
      const q = wordQuestion('read.dig.sh');
      expect(q.choices.find((c) => c.id === q.answer)!.emoji).toBeTruthy();
      for (const c of q.choices.filter((x) => x.id !== q.answer)) expect(c.tags?.length).toBe(1);
    }
  });
  it('picks near-miss distractors at higher difficulty', () => {
    let near = 0;
    for (let i = 0; i < 60; i++) {
      const q = wordQuestion('read.dig.sh', { difficulty: 2 });
      if (q.choices.some((c) => c.id !== q.answer && (c.id[0] === q.word![0] || c.id.at(-1) === q.word!.at(-1)))) near++;
    }
    expect(near).toBeGreaterThan(50);
  });
  it('avoids repeating words in a round', () => {
    const avoid = ['cat', 'hat', 'bat', 'map', 'bag', 'van', 'rat', 'jam', 'ham', 'can', 'pan', 'cap'];
    for (let i = 0; i < 20; i++) expect(wordQuestion('read.cvc.a', { avoid }).word).toBe('sad');
  });
  it('sight words: three words, one answer', () => { for (let i = 0; i < 30; i++) { const q = sightQuestion('read.sight'); sane(q); expect(q.choices).toHaveLength(3); } });
  it('math answers are right', () => {
    for (let i = 0; i < 200; i++) {
      const add = addQuestion('math.add.20'); expect(Number(add.answer)).toBe(add.a! + add.b!);
      const a5 = addQuestion('math.add.5'); expect(Number(a5.answer)).toBeLessThanOrEqual(5);
      const sub = subQuestion('math.sub.10'); expect(Number(sub.answer)).toBe(sub.a! - sub.b!); expect(sub.a!).toBeLessThanOrEqual(10);
      const m = make10Question('math.make10'); expect(m.a! + Number(m.answer)).toBe(10);
      const c = countQuestion('math.count.20'); expect(Number(c.answer)).toBeGreaterThanOrEqual(11); expect(Number(c.answer)).toBeLessThanOrEqual(20);
      const cm = compareQuestion('math.compare', { difficulty: 2 });
      expect(cm.answer).toBe(cm.a! > cm.b! ? '>' : cm.a! < cm.b! ? '<' : '=');
    }
  });
  it('tags the classic mistakes', () => {
    let sawSubForAdd = false, sawAddForSub = false, sawCross = false, sawOff1 = false;
    for (let i = 0; i < 400; i++) {
      const a = addQuestion('math.add.10');
      if (a.choices.some((c) => c.tags?.includes('math:sub-for-add'))) sawSubForAdd = true;
      if (a.choices.some((c) => c.tags?.includes('math:off1'))) sawOff1 = true;
      const b = addQuestion('math.add.20');
      if (b.choices.some((c) => c.tags?.includes('math:cross10'))) sawCross = true;
      const s = subQuestion('math.sub.10');
      if (s.choices.some((c) => c.tags?.includes('math:add-for-sub'))) sawAddForSub = true;
    }
    expect([sawSubForAdd, sawAddForSub, sawCross, sawOff1]).toEqual([true, true, true, true]);
  });
});

describe('maze', () => {
  it('every cell is reachable and numbers sit in distinct cells', () => {
    for (let s = 5; s <= 9; s++) {
      const m = generateMaze(s, s, 4);
      expect(reachable(m)).toBe(s * s);
      expect(new Set(m.numbers.map((n) => `${n.x},${n.y}`)).size).toBe(4);
      expect(m.numbers.some((n) => (n.x === 0 && n.y === 0) || (n.x === s - 1 && n.y === s - 1))).toBe(false);
    }
  });
});

describe('tic-tac-toe', () => {
  const B = (s: string): Board => s.split('').map((c) => (c === '.' ? null : (c as 'X' | 'O')));
  it('detects wins and draws', () => {
    expect(winner(B('XXX......'))).toBe('X');
    expect(winner(B('O..O..O..'))).toBe('O');
    expect(winner(B('XOXXOOOXX'))).toBe('draw');
    expect(winner(B('.........'))).toBeNull();
  });
  it('medium helper takes a win and blocks (when not making a random slip)', () => {
    expect(aiMove(B('OO.XX....'), 'medium', () => 0.9)).toBe(2);
    expect(aiMove(B('XX.O.....'), 'medium', () => 0.9)).toBe(2);
    expect(winningMove(B('XX.O.....'), 'X')).toBe(2);
  });
  it('always plays a legal move and can lose', () => {
    for (let g = 0; g < 200; g++) {
      let b = B('.........'); let turn: 'X' | 'O' = 'X';
      while (!winner(b)) {
        const empties = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
        const m = turn === 'O' ? aiMove(b, g % 2 ? 'easy' : 'medium') : empties[Math.floor(Math.random() * empties.length)];
        expect(empties).toContain(m);
        b = b.map((v, i) => (i === m ? turn : v)); turn = turn === 'X' ? 'O' : 'X';
      }
    }
  });
});

describe('time and pin', () => {
  it('bedtime window, including across midnight', () => {
    const at = (h: number, m = 0) => new Date(2026, 0, 1, h, m);
    const b = { from: '19:30', to: '07:00' };
    expect(inBedtime(b, at(20))).toBe(true); expect(inBedtime(b, at(3))).toBe(true);
    expect(inBedtime(b, at(7, 0))).toBe(false); expect(inBedtime(b, at(12))).toBe(false); expect(inBedtime(b, at(19, 29))).toBe(false);
    expect(inBedtime({ from: '13:00', to: '14:00' }, at(13, 30))).toBe(true);
    expect(inBedtime(null, at(3))).toBe(false);
  });
  it('hashes a PIN deterministically with a salt', async () => {
    expect(await hashPin('1234', 'a')).toBe(await hashPin('1234', 'a'));
    expect(await hashPin('1234', 'a')).not.toBe(await hashPin('1234', 'b'));
    expect(await hashPin('1234', 'a')).not.toBe(await hashPin('1235', 'a'));
  });
});
