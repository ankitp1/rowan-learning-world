import { todayKey } from './db';

export interface DayRoutine {
  dayIndex: number;
  dayName: string;
  title: string;
  tagline: string;
  reading: { appId: string; title: string; icon: string; blurb: string };
  math: { appId: string; title: string; icon: string; blurb: string };
}

export const WEEKLY_ROUTINES: DayRoutine[] = [
  {
    dayIndex: 0,
    dayName: 'Sunday',
    title: 'Sunday Celebration Voyage',
    tagline: 'Build words & add treasure to wrap up the week!',
    reading: { appId: 'word-builder', title: 'Word Builder', icon: '🔤', blurb: 'Spell 5 words with letter tiles' },
    math: { appId: 'treasure-add', title: 'Treasure Add', icon: '🧰', blurb: 'Add gems into the chest 5 times' },
  },
  {
    dayIndex: 1,
    dayName: 'Monday',
    title: 'Word & Coin Monday',
    tagline: 'Start the week strong with words & coin counting!',
    reading: { appId: 'word-builder', title: 'Word Builder', icon: '🔤', blurb: 'Spell 5 words with letter tiles' },
    math: { appId: 'coin-count', title: 'Coin Count', icon: '🪙', blurb: 'Count 5 coin piles & compare' },
  },
  {
    dayIndex: 2,
    dayName: 'Tuesday',
    title: 'Rhyme & Bridge Tuesday',
    tagline: 'Swing to rhyming ropes & fix number bridges!',
    reading: { appId: 'rhyme-ropes', title: 'Rhyme Ropes', icon: '🪢', blurb: 'Swing to 5 rhyming words' },
    math: { appId: 'number-bridge', title: 'Number Bonds Bridge', icon: '🌉', blurb: 'Fix 5 bridges to make 10 or 20' },
  },
  {
    dayIndex: 3,
    dayName: 'Wednesday',
    title: 'Plank & Treasure Wednesday',
    tagline: 'Sound out wooden planks & fill the treasure chest!',
    reading: { appId: 'blend-plank', title: 'Blend the Plank', icon: '🪵', blurb: 'Sound out & read 5 planks' },
    math: { appId: 'treasure-add', title: 'Treasure Add', icon: '🧰', blurb: 'Add gems into the chest 5 times' },
  },
  {
    dayIndex: 4,
    dayName: 'Thursday',
    title: 'Sight & Subtract Thursday',
    tagline: 'Target sight words & outsmart the sneaky thief!',
    reading: { appId: 'sight-cannon', title: 'Sight-Word Cannon', icon: '💥', blurb: 'Fire at 5 sight words' },
    math: { appId: 'sneaky-thief', title: 'Sneaky Thief', icon: '🐦', blurb: 'Find how many remain after thief takes some' },
  },
  {
    dayIndex: 5,
    dayName: 'Friday',
    title: 'Directions & Compare Friday',
    tagline: 'Read explorer log directions & compare piles!',
    reading: { appId: 'captains-log', title: "Captain's Log", icon: '📜', blurb: 'Read & follow 5 explorer directions' },
    math: { appId: 'coin-count', title: 'Coin Comparison', icon: '🪙', blurb: 'Compare 5 coin piles' },
  },
  {
    dayIndex: 6,
    dayName: 'Saturday',
    title: 'Adventure Saturday',
    tagline: 'Weekend challenge: master planks & build bridges!',
    reading: { appId: 'blend-plank', title: 'Blend the Plank', icon: '🪵', blurb: 'Sound out & read 5 planks' },
    math: { appId: 'number-bridge', title: 'Number Bonds Bridge', icon: '🌉', blurb: 'Fix 5 bridges to make 10 or 20' },
  },
];

export function getTodayRoutine(dayIndex?: number): DayRoutine {
  const d = dayIndex ?? new Date().getDay();
  return WEEKLY_ROUTINES[d] ?? WEEKLY_ROUTINES[1];
}

const unlockKey = (profileId: string, day: string) => `rlw.voyage.unlocked.${profileId}.${day}`;
const deviceUnlockKey = (day: string) => `rlw.voyage.unlocked.device.${day}`;

const memStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage.getItem(key);
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch {
    /* ignore */
  }
  return memStore.get(key) ?? null;
}

function setStorageItem(key: string, value: string): void {
  memStore.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch {
    /* ignore */
  }
}

function removeStorageItem(key: string): void {
  memStore.delete(key);
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.removeItem === 'function') {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

export function clearVoyageStorage(): void {
  memStore.clear();
}

/** Check whether Games Island is unlocked for today. */
export function isVoyageUnlocked(profileId: string, day: string = todayKey()): boolean {
  if (getStorageItem(unlockKey(profileId, day)) === '1') return true;
  if (getStorageItem(deviceUnlockKey(day)) === '1') return true;
  return false;
}

/** Unlock Games Island for today (via 5/5 score or adult override). */
export function unlockVoyageToday(profileId: string, day: string = todayKey()) {
  setStorageItem(unlockKey(profileId, day), '1');
  setStorageItem(deviceUnlockKey(day), '1');
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('voyage:unlocked', { detail: { profileId, day } }));
    }
  } catch {
    // ignore
  }
}

/** Relock Games Island for today (parent control). */
export function relockVoyageToday(profileId: string, day: string = todayKey()) {
  removeStorageItem(unlockKey(profileId, day));
  removeStorageItem(deviceUnlockKey(day));
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('voyage:unlocked', { detail: { profileId, day } }));
    }
  } catch {
    // ignore
  }
}
