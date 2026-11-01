import { lazy } from 'react';
import type { MiniApp } from './types';

/**
 * The mini-app registry. Adding a game = add a folder under src/apps and one
 * entry here. The hub, missions, Parent Mode toggles and reports pick it up.
 */
export const APPS: MiniApp[] = [
  {
    id: 'word-builder', title: 'Word Builder', subject: 'reading', icon: '🔤',
    blurb: 'Build words from letters',
    skills: ['read.cvc.a', 'read.cvc.i', 'read.cvc.o', 'read.cvc.e', 'read.cvc.u', 'read.dig.sh', 'read.dig.ch', 'read.dig.th',
      'read.dig.ck', 'read.blend.init', 'read.blend.final', 'read.silent-e'],
    component: lazy(() => import('../apps/WordBuilder')),
  },
  {
    id: 'blend-plank', title: 'Blend the Plank', subject: 'reading', icon: '🪵',
    blurb: 'Slide sounds together, find the picture',
    skills: ['read.cvc.a', 'read.cvc.i', 'read.cvc.o', 'read.cvc.e', 'read.cvc.u', 'read.dig.sh', 'read.dig.ch', 'read.dig.th',
      'read.dig.ck', 'read.blend.init', 'read.blend.final', 'read.silent-e'],
    component: lazy(() => import('../apps/BlendPlank')),
  },
  {
    id: 'sight-cannon', title: 'Sight-word Cannon', subject: 'reading', icon: '💥',
    blurb: 'Hear a word, fire at it',
    skills: ['read.sight'],
    component: lazy(() => import('../apps/SightCannon')),
  },
  {
    id: 'rhyme-ropes', title: 'Rhyme Ropes', subject: 'reading', icon: '🪢',
    blurb: 'Swing to the word that rhymes',
    skills: ['read.rhyme'],
    component: lazy(() => import('../apps/RhymeRopes')),
  },
  {
    id: 'group-names', title: 'Group Names', subject: 'reading', icon: '🦁',
    blurb: 'A pride of lions? A herd of cows?',
    skills: ['read.groups'],
    component: lazy(() => import('../apps/GroupNames')),
  },
  {
    id: 'captains-log', title: "Captain's Log", subject: 'reading', icon: '📜',
    blurb: 'Read the directions, then do them',
    skills: ['read.comp.follow'],
    component: lazy(() => import('../apps/CaptainsLog')),
  },
  {
    id: 'number-bridge', title: 'Number Bonds Bridge', subject: 'math', icon: '🌉',
    blurb: 'Fix the bridge: make 10',
    skills: ['math.make10'],
    component: lazy(() => import('../apps/NumberBridge')),
  },
  {
    id: 'mystery-story', title: 'The Missing Map', subject: 'reading', icon: '🔍', place: 'mystery',
    blurb: 'Read, find clues, solve the case',
    skills: ['read.comp.recall', 'read.comp.sequence', 'read.comp.infer'],
    component: lazy(() => import('../apps/MysteryStory')),
  },
  {
    id: 'coin-count', title: 'Coin Count', subject: 'math', icon: '🪙',
    blurb: 'Count and compare piles',
    skills: ['math.count.10', 'math.count.20', 'math.compare'],
    component: lazy(() => import('../apps/CoinCount')),
  },
  {
    id: 'treasure-add', title: 'Treasure Add', subject: 'math', icon: '🧰',
    blurb: 'Add to fill the chest',
    skills: ['math.add.5', 'math.add.10', 'math.make10', 'math.add.20'],
    component: lazy(() => import('../apps/TreasureAdd')),
  },
  {
    id: 'sneaky-thief', title: 'Sneaky Thief', subject: 'math', icon: '🐦',
    blurb: 'How many are left?',
    skills: ['math.sub.5', 'math.sub.10', 'math.sub.20'],
    component: lazy(() => import('../apps/SneakyThief')),
  },
  {
    id: 'tic-tac-toe', title: 'Tic-Tac-Toe', subject: 'games', icon: '❌',
    blurb: 'Play the helper or a grown-up', skills: [],
    component: lazy(() => import('../apps/TicTacToe')),
  },
  {
    id: 'maze', title: 'Number Maze', subject: 'games', icon: '🌀',
    blurb: 'Collect 1, 2, 3 in order, then escape', skills: [],
    component: lazy(() => import('../apps/Maze')),
  },
  {
    id: 'code-breaker', title: 'Code Breaker', subject: 'games', icon: '🔐', place: 'brain',
    blurb: 'Crack the secret code from the clues', skills: [],
    component: lazy(() => import('../apps/CodeBreaker.tsx')),
  },
  {
    id: 'hanoi', title: 'Tower Puzzle', subject: 'games', icon: '🗼', place: 'brain',
    blurb: 'Move the whole tower, one disk at a time', skills: [],
    component: lazy(() => import('../apps/Hanoi.tsx')),
  },
  {
    id: 'memory-match', title: 'Memory Match', subject: 'games', icon: '🃏', place: 'brain',
    blurb: 'Flip cards and find the pairs', skills: [],
    component: lazy(() => import('../apps/MemoryMatch')),
  },
  {
    id: 'echo', title: 'Echo Sequence', subject: 'games', icon: '🎵', place: 'brain',
    blurb: 'Watch, listen, then repeat the pattern', skills: [],
    component: lazy(() => import('../apps/Echo')),
  },
  {
    id: 'whats-missing', title: "What's Missing?", subject: 'games', icon: '🔎', place: 'brain',
    blurb: 'Look closely. Which one disappeared?', skills: [],
    component: lazy(() => import('../apps/WhatsMissing')),
  },
];

export const appById = (id: string) => APPS.find((a) => a.id === id);
