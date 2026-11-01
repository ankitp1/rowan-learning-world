import { useSyncExternalStore } from 'react';
import type { Attempt, Profile, SkillState } from './types';

/**
 * Local-only storage (localStorage). All data is keyed by profile so it can be
 * swapped for IndexedDB / cloud sync later without touching the games.
 */
const KEY = 'rowan-learning-world.v1';
const MAX_ATTEMPTS = 6000;

export interface DB {
  version: 1;
  profiles: Profile[];
  attempts: Record<string, Attempt[]>;
  skills: Record<string, Record<string, SkillState>>;
  /** profileId -> yyyy-mm-dd -> ms played */
  playtime: Record<string, Record<string, number>>;
  /** profileId -> yyyy-mm-dd -> deviceId -> ms played (for conflict-free multi-device sum) */
  devicePlaytime?: Record<string, Record<string, Record<string, number>>>;
  /** profileId -> appId -> ms played */
  appTime: Record<string, Record<string, number>>;
  /** Per-player game levels (e.g. rlw.maze.<pid> -> level) synced across devices */
  gameLevels?: Record<string, number>;
  /** Tombstones for deleted profiles (profileId -> deletedAt ms) so sync doesn't resurrect them */
  deletedProfiles?: Record<string, number>;
  /** profileId -> skillId -> resetAt ms so sync doesn't fold pre-reset attempts */
  skillResets?: Record<string, Record<string, number>>;
  /** One grown-up PIN covers every profile. */
  parent: { pinHash?: string; salt?: string; updatedAt?: number };
}

function empty(): DB {
  return {
    version: 1, profiles: [], attempts: {}, skills: {}, playtime: {},
    devicePlaytime: {}, appTime: {}, gameLevels: {}, deletedProfiles: {}, skillResets: {}, parent: {},
  };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch { /* ignore corrupt data */ }
  return empty();
}

let db: DB = load();
const listeners = new Set<() => void>();
const mutationListeners = new Set<(d: DB) => void>();

export const getDB = () => db;

export function update(fn: (d: DB) => void) {
  const next = structuredClone(db);
  fn(next);
  for (const pid of Object.keys(next.attempts)) {
    if (next.attempts[pid].length > MAX_ATTEMPTS) next.attempts[pid] = next.attempts[pid].slice(-MAX_ATTEMPTS);
  }
  db = next;
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full */ }
  listeners.forEach((l) => l());
  mutationListeners.forEach((m) => m(db));
}

/** Used by cloud sync when applying a merged remote snapshot without re-broadcasting an identical write. */
export function applyMergedDB(next: DB) {
  db = next;
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full */ }
  listeners.forEach((l) => l());
}

export function onLocalMutation(fn: (d: DB) => void) {
  mutationListeners.add(fn);
  return () => { mutationListeners.delete(fn); };
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useDB() {
  return useSyncExternalStore(subscribe, getDB);
}

export function resetAll() {
  update((d) => Object.assign(d, empty()));
}

export const todayKey = (t = Date.now()) => new Date(t).toLocaleDateString('en-CA');

export const uid = () => Math.random().toString(36).slice(2, 10);

const DEVICE_KEY = 'rowan-learning-world.deviceId.v1';
let cachedDeviceId = '';
export function getDeviceId(): string {
  if (cachedDeviceId) return cachedDeviceId;
  try {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing) { cachedDeviceId = existing; return existing; }
    const created = `dev_${uid()}_${uid()}`;
    localStorage.setItem(DEVICE_KEY, created);
    cachedDeviceId = created;
    return created;
  } catch {
    cachedDeviceId = `dev_${uid()}`;
    return cachedDeviceId;
  }
}

export function getProfile(id: string | undefined) {
  return db.profiles.find((p) => p.id === id);
}

export function createProfile(name: string, avatar: string, themeId: string): Profile {
  const now = Date.now();
  const p: Profile = {
    id: uid(), name, avatar, themeId, levels: {}, focusSkills: [], placementDone: false,
    stars: 0, stickers: [], createdAt: now, updatedAt: now,
    settings: { dailyMinutes: 0, hintMode: 'full', speechRate: 0.9, allowedThemes: [], disabledApps: [] },
  };
  update((d) => { d.profiles.push(p); });
  return p;
}

export function saveProfile(p: Profile) {
  const stamped = { ...p, updatedAt: Math.max(Date.now(), (p.updatedAt ?? 0) + 1) };
  update((d) => { d.profiles = d.profiles.map((x) => (x.id === stamped.id ? stamped : x)); });
}

export function patchProfile(id: string, fn: (p: Profile) => void) {
  update((d) => {
    const p = d.profiles.find((x) => x.id === id);
    if (p) { fn(p); p.updatedAt = Math.max(Date.now(), (p.updatedAt ?? 0) + 1); }
  });
}

export function deleteProfile(id: string) {
  update((d) => {
    d.profiles = d.profiles.filter((p) => p.id !== id);
    delete d.attempts[id]; delete d.skills[id]; delete d.playtime[id]; delete d.appTime[id];
    if (d.devicePlaytime) delete d.devicePlaytime[id];
    if (d.skillResets) delete d.skillResets[id];
    d.deletedProfiles ??= {};
    d.deletedProfiles[id] = Date.now();
  });
}

export function addPlaytime(pid: string, ms: number, appId?: string) {
  const devId = getDeviceId();
  update((d) => {
    const day = todayKey();
    d.devicePlaytime ??= {};
    d.devicePlaytime[pid] ??= {};
    d.devicePlaytime[pid][day] ??= {};
    const prevTotal = d.playtime[pid]?.[day] ?? 0;
    const prevSum = Object.values(d.devicePlaytime[pid][day]).reduce((a, b) => a + b, 0);
    // Preserve any legacy playtime that was recorded before devicePlaytime existed
    const legacyBase = Math.max(0, prevTotal - prevSum);
    d.devicePlaytime[pid][day][devId] = (d.devicePlaytime[pid][day][devId] ?? 0) + ms;
    const newSum = Object.values(d.devicePlaytime[pid][day]).reduce((a, b) => a + b, 0) + legacyBase;
    d.playtime[pid] ??= {};
    d.playtime[pid][day] = newSum;
    if (appId) {
      d.appTime[pid] ??= {};
      d.appTime[pid][appId] = (d.appTime[pid][appId] ?? 0) + ms;
    }
  });
}

export function playedToday(pid: string) {
  return db.playtime[pid]?.[todayKey()] ?? 0;
}

export function getGameLevel(key: string): number {
  const inDb = db.gameLevels?.[key];
  if (typeof inDb === 'number') return inDb;
  try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
}

export function setGameLevel(key: string, level: number) {
  try { localStorage.setItem(key, String(level)); } catch { /* ignore */ }
  update((d) => {
    d.gameLevels ??= {};
    d.gameLevels[key] = level;
  });
}
