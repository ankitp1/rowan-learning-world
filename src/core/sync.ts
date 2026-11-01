import { useSyncExternalStore } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { doc, getDoc, getFirestore, onSnapshot, setDoc, type Firestore, type Unsubscribe } from 'firebase/firestore';
import { applyMergedDB, getDB, getDeviceId, onLocalMutation, todayKey, uid, type DB } from './db';
import { DAY, applyAttempt, blankState } from './engine';
import { isLegacyDevice } from './legacyDevice';
import type { Attempt, Profile, SkillState, Subject } from './types';

export const FIREBASE_CONFIG = {
  projectId: 'rowan-learning-world-ap1',
  appId: '1:765766357587:web:7c257e082167856c6d2ca6',
  storageBucket: 'rowan-learning-world-ap1.firebasestorage.app',
  apiKey: 'AIzaSyDHSr5VVobDn1ZlWgHfexzapzH2_Ieb5VY',
  authDomain: 'rowan-learning-world-ap1.firebaseapp.com',
  messagingSenderId: '765766357587',
};

const SYNC_CODE_KEY = 'rowan-learning-world.syncCode.v1';
const DEFAULT_SYNC_CODE = 'rowan-family-main';
const MAX_ATTEMPTS = 6000;

export interface SyncStatus {
  code: string;
  state: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  lastSyncedAt?: number;
  error?: string;
}

/* ---------------- Deterministic Conflict-Free Merger ---------------- */

function attemptKey(a: Attempt): string {
  return `${a.at}|${a.appId}|${a.skillIds.join(',')}|${a.given ?? ''}|${a.correct ? 1 : 0}`;
}

function mergeProfile(a: Profile, b: Profile): Profile {
  const aTime = a.updatedAt ?? a.createdAt ?? 0;
  const bTime = b.updatedAt ?? b.createdAt ?? 0;
  const newer = bTime > aTime ? b : a;
  const older = newer === b ? a : b;

  const levels: Partial<Record<Subject, number>> = { ...older.levels, ...newer.levels };
  if (aTime === bTime) {
    for (const k of Object.keys({ ...a.levels, ...b.levels }) as Subject[]) {
      levels[k] = Math.max(a.levels[k] ?? 0, b.levels[k] ?? 0);
    }
  }

  const stickers = [...new Set([...(a.stickers ?? []), ...(b.stickers ?? [])])];

  return {
    ...older,
    ...newer,
    levels,
    stars: Math.max(a.stars ?? 0, b.stars ?? 0),
    missionsDone: Math.max(a.missionsDone ?? 0, b.missionsDone ?? 0),
    stickers,
    placementDone: Boolean(a.placementDone || b.placementDone),
    createdAt: Math.min(a.createdAt || Date.now(), b.createdAt || Date.now()),
    updatedAt: Math.max(aTime, bTime),
    settings: {
      ...older.settings,
      ...newer.settings,
    },
  };
}

/**
 * Pure conflict-free merge of two DB snapshots (local and cloud).
 * - Profiles merge by ID (respecting deletion tombstones and updatedAt timestamps).
 * - Stars, missionsDone, stickers, placementDone, and gameLevels merge monotonically.
 * - Attempts are unioned by timestamp/signature and sorted chronologically.
 * - Skill mastery states are deterministically recomputed from the merged chronological attempts.
 * - Playtime sums across distinct deviceIds without double-counting repeated syncs from the same device.
 */
export function mergeDB(local: DB, remote: DB): DB {
  const deletedProfiles: Record<string, number> = {
    ...(local.deletedProfiles ?? {}),
  };
  for (const [id, ts] of Object.entries(remote.deletedProfiles ?? {})) {
    deletedProfiles[id] = Math.max(deletedProfiles[id] ?? 0, ts);
  }

  const profMap = new Map<string, Profile>();
  for (const p of local.profiles ?? []) {
    if ((deletedProfiles[p.id] ?? 0) < (p.createdAt ?? 1)) profMap.set(p.id, structuredClone(p));
  }
  for (const p of remote.profiles ?? []) {
    if ((deletedProfiles[p.id] ?? 0) >= (p.createdAt ?? 1)) continue;
    const existing = profMap.get(p.id);
    profMap.set(p.id, existing ? mergeProfile(existing, p) : structuredClone(p));
  }
  const profiles = [...profMap.values()].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  const activeIds = new Set(profiles.map((p) => p.id));

  // Merge skill reset timestamps
  const skillResets: Record<string, Record<string, number>> = {};
  for (const pid of activeIds) {
    const lRes = local.skillResets?.[pid] ?? {};
    const rRes = remote.skillResets?.[pid] ?? {};
    const keys = new Set([...Object.keys(lRes), ...Object.keys(rRes)]);
    if (keys.size) {
      skillResets[pid] = {};
      for (const k of keys) skillResets[pid][k] = Math.max(lRes[k] ?? 0, rRes[k] ?? 0);
    }
  }

  // Merge attempts per profile
  const attempts: Record<string, Attempt[]> = {};
  for (const pid of activeIds) {
    const byKey = new Map<string, Attempt>();
    for (const a of local.attempts?.[pid] ?? []) byKey.set(attemptKey(a), a);
    for (const a of remote.attempts?.[pid] ?? []) byKey.set(attemptKey(a), a);
    const list = [...byKey.values()].sort((a, b) => a.at - b.at);
    attempts[pid] = list.length > MAX_ATTEMPTS ? list.slice(-MAX_ATTEMPTS) : list;
  }

  // Recompute skill states from merged attempts + placement flags
  const skills: Record<string, Record<string, SkillState>> = {};
  for (const pid of activeIds) {
    skills[pid] = {};
    const lSkills = local.skills?.[pid] ?? {};
    const rSkills = remote.skills?.[pid] ?? {};
    const resetMap = skillResets[pid] ?? {};
    const allSkillIds = new Set<string>([
      ...Object.keys(lSkills),
      ...Object.keys(rSkills),
    ]);
    for (const a of attempts[pid] ?? []) {
      for (const sid of a.skillIds) allSkillIds.add(sid);
    }

    for (const sid of allSkillIds) {
      const resetAt = resetMap[sid] ?? 0;
      const ls = lSkills[sid];
      const rs = rSkills[sid];
      const placedLocal = ls?.placed && (ls.lastSeen ?? 0) > resetAt ? ls : undefined;
      const placedRemote = rs?.placed && (rs.lastSeen ?? 0) > resetAt ? rs : undefined;
      const placedSource = placedLocal ?? placedRemote;

      const relevantAttempts = (attempts[pid] ?? []).filter(
        (a) => a.at > resetAt && a.skillIds.includes(sid),
      );

      if (!placedSource && relevantAttempts.length === 0) continue;

      let state: SkillState | undefined = placedSource
        ? {
            ...blankState(sid),
            mastery: 75,
            placed: true,
            status: 'getting',
            lastSeen: placedSource.lastSeen || Date.now(),
            nextReview: placedSource.nextReview ?? (placedSource.lastSeen || Date.now()) + 2 * DAY,
            recent: [],
            errors: {},
          }
        : undefined;

      for (const a of relevantAttempts) {
        state = applyAttempt(state, sid, a);
      }
      if (state) {
        if (placedSource) state.placed = true;
        skills[pid][sid] = state;
      }
    }
  }

  // Merge per-device playtime and total playtime
  const devicePlaytime: Record<string, Record<string, Record<string, number>>> = {};
  const playtime: Record<string, Record<string, number>> = {};
  for (const pid of activeIds) {
    const lDays = local.playtime?.[pid] ?? {};
    const rDays = remote.playtime?.[pid] ?? {};
    const lDevDays = local.devicePlaytime?.[pid] ?? {};
    const rDevDays = remote.devicePlaytime?.[pid] ?? {};
    const days = new Set([
      ...Object.keys(lDays),
      ...Object.keys(rDays),
      ...Object.keys(lDevDays),
      ...Object.keys(rDevDays),
    ]);
    if (days.size) {
      playtime[pid] = {};
      devicePlaytime[pid] = {};
      for (const d of days) {
        const devMap: Record<string, number> = { ...(lDevDays[d] ?? {}) };
        for (const [devId, ms] of Object.entries(rDevDays[d] ?? {})) {
          devMap[devId] = Math.max(devMap[devId] ?? 0, ms);
        }
        devicePlaytime[pid][d] = devMap;
        const devSum = Object.values(devMap).reduce((a, b) => a + b, 0);
        playtime[pid][d] = Math.max(devSum, lDays[d] ?? 0, rDays[d] ?? 0);
      }
    }
  }

  // Merge appTime
  const appTime: Record<string, Record<string, number>> = {};
  for (const pid of activeIds) {
    const lApp = local.appTime?.[pid] ?? {};
    const rApp = remote.appTime?.[pid] ?? {};
    const keys = new Set([...Object.keys(lApp), ...Object.keys(rApp)]);
    if (keys.size) {
      appTime[pid] = {};
      for (const k of keys) appTime[pid][k] = Math.max(lApp[k] ?? 0, rApp[k] ?? 0);
    }
  }

  // Merge gameLevels
  const gameLevels: Record<string, number> = { ...(local.gameLevels ?? {}) };
  for (const [k, v] of Object.entries(remote.gameLevels ?? {})) {
    gameLevels[k] = Math.max(gameLevels[k] ?? 0, v);
  }

  // Merge parent PIN
  const lParent = local.parent ?? {};
  const rParent = remote.parent ?? {};
  let parent = lParent;
  if ((rParent.updatedAt ?? 0) > (lParent.updatedAt ?? 0)) parent = rParent;
  else if (!lParent.pinHash && rParent.pinHash) parent = rParent;

  return {
    version: 1,
    profiles,
    attempts,
    skills,
    playtime,
    devicePlaytime,
    appTime,
    gameLevels,
    deletedProfiles,
    skillResets,
    parent,
  };
}

/* ---------------- Firestore Real-Time Sync Service ---------------- */

let status: SyncStatus = {
  code: readInitialSyncCode(),
  state: 'idle',
};
const statusListeners = new Set<() => void>();
let firestoreInstance: Firestore | null = null;
let unsubscribeSnapshot: Unsubscribe | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let legacyPollTimer: ReturnType<typeof setInterval> | null = null;
let lastPushedJson = '';

function restDocUrl(code: string): string {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/families/${encodeURIComponent(code)}?key=${FIREBASE_CONFIG.apiKey}`;
}

function xhrRequest(method: 'GET' | 'PATCH', url: string, body?: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if (body) xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.send(body ?? null);
  });
}

async function restPush(code: string, serialized: string): Promise<void> {
  const payload = JSON.stringify({
    fields: {
      db: { stringValue: serialized },
      updatedAt: { integerValue: String(Date.now()) },
      updatedBy: { stringValue: getDeviceId() },
      version: { integerValue: '1' },
    },
  });
  const res = await xhrRequest('PATCH', restDocUrl(code), payload);
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`HTTP ${res.status}`);
  }
}

async function restPull(code: string): Promise<string | null> {
  const res = await xhrRequest('GET', restDocUrl(code));
  if (res.status === 404) return null;
  if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
  const parsed = JSON.parse(res.text);
  return parsed?.fields?.db?.stringValue ?? null;
}

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((l) => l());
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(l: () => void) {
  statusListeners.add(l);
  return () => { statusListeners.delete(l); };
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus);
}

function sanitizeCode(raw: string): string {
  return raw.trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
}

function readInitialSyncCode(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = sanitizeCode(params.get('sync') ?? '');
    if (fromUrl.length >= 8) {
      localStorage.setItem(SYNC_CODE_KEY, fromUrl);
      return fromUrl;
    }
    const stored = sanitizeCode(localStorage.getItem(SYNC_CODE_KEY) ?? '');
    if (stored.length >= 8) return stored;
  } catch { /* ignore */ }
  return DEFAULT_SYNC_CODE;
}

function getFirestoreDB(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (e) {
    setStatus({ state: 'error', error: e instanceof Error ? e.message : 'Firebase init failed' });
    return null;
  }
}

export async function pushNow(): Promise<void> {
  const code = status.code;
  if (code.length < 8) return;
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
  const current = getDB();
  const serialized = JSON.stringify(current);
  lastPushedJson = serialized;
  setStatus({ state: 'syncing', error: undefined });
  try {
    const fdb = isLegacyDevice() ? null : getFirestoreDB();
    if (fdb) {
      const ref = doc(fdb, 'families', code);
      await setDoc(ref, {
        db: serialized,
        updatedAt: Date.now(),
        updatedBy: getDeviceId(),
        version: 1,
      });
    } else {
      await restPush(code, serialized);
    }
    setStatus({ state: 'synced', lastSyncedAt: Date.now(), error: undefined });
  } catch (e) {
    // Fallback to REST if SDK write failed on an older WebView/browser
    try {
      await restPush(code, serialized);
      setStatus({ state: 'synced', lastSyncedAt: Date.now(), error: undefined });
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : e instanceof Error ? e.message : 'Sync failed';
      setStatus({ state: navigator.onLine ? 'error' : 'offline', error: msg });
    }
  }
}

function schedulePush(delayMs = 600) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void pushNow(); }, delayMs);
}

export async function pullAndMergeNow(): Promise<void> {
  const code = status.code;
  if (code.length < 8) return;
  setStatus({ state: 'syncing', error: undefined });
  try {
    let remoteDbStr: string | null = null;
    const fdb = isLegacyDevice() ? null : getFirestoreDB();
    if (fdb) {
      const ref = doc(fdb, 'families', code);
      const snap = await getDoc(ref);
      if (snap.exists() && typeof snap.data()?.db === 'string') {
        remoteDbStr = snap.data().db as string;
      }
    } else {
      remoteDbStr = await restPull(code);
    }
    if (remoteDbStr) {
      const remote = JSON.parse(remoteDbStr) as DB;
      const local = getDB();
      const merged = mergeDB(local, remote);
      const mergedJson = JSON.stringify(merged);
      applyMergedDB(merged);
      if (mergedJson !== remoteDbStr) {
        await pushNow();
      } else {
        lastPushedJson = mergedJson;
        setStatus({ state: 'synced', lastSyncedAt: Date.now(), error: undefined });
      }
      return;
    }
    // No remote doc yet: push our local state to initialize it
    await pushNow();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sync failed';
    setStatus({ state: navigator.onLine ? 'error' : 'offline', error: msg });
  }
}

export function setSyncCode(newCodeRaw: string) {
  const clean = sanitizeCode(newCodeRaw);
  if (clean.length < 8) return false;
  try { localStorage.setItem(SYNC_CODE_KEY, clean); } catch { /* ignore */ }
  setStatus({ code: clean, state: 'syncing', error: undefined });
  connectSync(clean);
  return true;
}

export function generateNewSyncCode(): string {
  const code = `rowan-${uid()}`;
  setSyncCode(code);
  return code;
}

function connectSync(code = status.code) {
  if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
  if (legacyPollTimer) { clearInterval(legacyPollTimer); legacyPollTimer = null; }
  if (code.length < 8) return;

  // On legacy devices (e.g. iOS 9.3.5 Safari), use lightweight XHR REST sync + periodic polling
  if (isLegacyDevice()) {
    void pullAndMergeNow();
    legacyPollTimer = setInterval(() => {
      if (!document.hidden && navigator.onLine) void pullAndMergeNow();
    }, 10_000);
    return;
  }

  const fdb = getFirestoreDB();
  if (!fdb) return;

  const ref = doc(fdb, 'families', code);
  setStatus({ code, state: 'syncing', error: undefined });

  unsubscribeSnapshot = onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        // First time this family code is used in the cloud: upload local data if we have any
        const cur = getDB();
        if (cur.profiles.length > 0 || cur.parent.pinHash) {
          void pushNow();
        } else {
          setStatus({ state: 'synced', lastSyncedAt: Date.now(), error: undefined });
        }
        return;
      }
      const data = snap.data();
      if (typeof data?.db !== 'string') return;
      try {
        const remote = JSON.parse(data.db) as DB;
        const local = getDB();
        const localJson = JSON.stringify(local);
        const merged = mergeDB(local, remote);
        const mergedJson = JSON.stringify(merged);

        if (mergedJson !== localJson) {
          applyMergedDB(merged);
        }
        setStatus({ state: 'synced', lastSyncedAt: Date.now(), error: undefined });

        // If merging local offline progress added new data not yet in remote, push the merged state back
        if (mergedJson !== data.db && mergedJson !== lastPushedJson) {
          schedulePush(400);
        }
      } catch {
        /* ignore malformed remote doc */
      }
    },
    (err) => {
      setStatus({ state: navigator.onLine ? 'error' : 'offline', error: err.message });
    },
  );
}

let started = false;
export function startCloudSync() {
  if (started) return;
  // Skip live network sockets during automated Vitest runs
  if (import.meta.env.MODE === 'test') return;
  started = true;

  connectSync(status.code);

  onLocalMutation((nextDb) => {
    const json = JSON.stringify(nextDb);
    if (json === lastPushedJson) return;
    schedulePush(500);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => { void pullAndMergeNow(); });
    window.addEventListener('offline', () => { setStatus({ state: 'offline' }); });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) void pullAndMergeNow();
    });
  }
}

export { todayKey };
