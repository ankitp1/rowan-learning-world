import { Suspense, useCallback, useEffect, useState } from 'react';
import { getDB, getProfile, useDB } from './core/db';
import { focusFirst, useBackHandler, useSpatialNav } from './core/nav';
import { initTVOptimization } from './core/tv';
import { appById } from './core/registry';
import { loadRecordedSounds, setSpeechRate, stopSpeaking } from './core/speech';
import { startCloudSync } from './core/sync';
import { applyTheme, themeById } from './core/themes';
import type { Subject } from './core/types';
import { Scenery } from './ui/Art';
import Hub, { IslandMenu, type IslandKey } from './screens/Hub';
import Mission from './screens/Mission';
import Placement from './screens/Placement';
import TimeGuard from './screens/TimeGuard';
import WhoPlaying from './screens/WhoPlaying';
import Gate from './screens/parent/Gate';
import ParentHome from './screens/parent/ParentHome';

type Route =
  | { name: 'who' }
  | { name: 'hub' }
  | { name: 'island'; key: IslandKey }
  | { name: 'play'; appId: string; from: IslandKey }
  | { name: 'mission' }
  | { name: 'placement'; fromParent?: boolean; subjects?: Subject[] }
  | { name: 'parent' };

/** Debug/preview aid: open straight to a screen with e.g. `#hub`, `#island:reading`, `#play:word-builder`, `#mission`, `#parent`. Needs an existing player. */
function startFromHash(): { route: Route; pid?: string } {
  const pid = getDB().profiles[0]?.id;
  const [name, arg] = location.hash.slice(1).split(':');
  if (!pid || !name) return { route: { name: 'who' } };
  if (name === 'hub') return { pid, route: { name: 'hub' } };
  if (name === 'mission') return { pid, route: { name: 'mission' } };
  if (name === 'parent') return { pid, route: { name: 'parent' } };
  if (name === 'island') return { pid, route: { name: 'island', key: arg as IslandKey } };
  if (name === 'play' && appById(arg)) return { pid, route: { name: 'play', appId: arg, from: 'reading' } };
  return { route: { name: 'who' } };
}

export default function App() {
  const db = useDB();
  const [start] = useState(startFromHash);
  const [route, setRoute] = useState<Route>(start.route);
  const [pid, setPid] = useState<string | undefined>(start.pid);
  const [gate, setGate] = useState(false);
  const [lastIsland, setLastIsland] = useState<IslandKey | undefined>();
  const profile = db.profiles.find((p) => p.id === pid);
  const theme = themeById(profile?.themeId ?? 'pirate');

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { setSpeechRate(profile?.settings.speechRate ?? 0.9); }, [profile?.settings.speechRate]);
  useEffect(() => { loadRecordedSounds(); startCloudSync(); initTVOptimization(); }, []);

  // Keep the D-pad cursor on something sensible after every screen change.
  const routeKey = route.name + ('key' in route ? route.key : '') + ('appId' in route ? route.appId : '') + String(gate);
  useEffect(() => { stopSpeaking(); const id = setTimeout(focusFirst, 120); return () => clearTimeout(id); }, [routeKey]);

  const pick = (id: string) => {
    setPid(id);
    const p = getProfile(id); // read fresh: a just-created profile isn't in this render's snapshot
    setRoute(p && !p.placementDone ? { name: 'placement' } : { name: 'hub' });
  };

  // Close Grown-ups PIN gate modal first if open
  useBackHandler(() => {
    setGate(false);
    return true;
  }, gate);

  const back = useCallback(() => {
    if (route.name === 'who') return false;
    setRoute((r) => {
      switch (r.name) {
        case 'play': return { name: 'island', key: r.from };
        case 'island': case 'mission': return { name: 'hub' };
        case 'placement': return r.fromParent ? { name: 'parent' } : profile?.placementDone ? { name: 'hub' } : { name: 'who' };
        case 'parent': return profile ? { name: 'hub' } : { name: 'who' };
        case 'hub': return { name: 'who' };
        default: return r;
      }
    });
    return true;
  }, [profile, route.name]);
  useSpatialNav(back);

  const needsProfile = route.name !== 'who' && route.name !== 'parent' && !profile;
  useEffect(() => { if (needsProfile) setRoute({ name: 'who' }); }, [needsProfile]);

  let body;
  if (route.name === 'parent') {
    body = (
      <ParentHome
        initialProfileId={pid}
        onExit={() => setRoute(profile ? { name: 'hub' } : { name: 'who' })}
        onPlacement={(id) => { setPid(id); setRoute({ name: 'placement', fromParent: true }); }}
      />
    );
  } else if (route.name === 'who' || !profile) {
    body = <WhoPlaying onPick={pick} onGrownUps={() => setGate(true)} />;
  } else if (route.name === 'placement') {
    body = (
      <Placement
        profile={profile} theme={theme} subjects={route.subjects}
        onDone={() => setRoute(route.fromParent ? { name: 'parent' } : { name: 'hub' })}
        onExit={back}
      />
    );
  } else if (route.name === 'hub') {
    body = (
      <Hub
        profile={profile} theme={theme}
        lastIsland={lastIsland}
        onIsland={(key) => { setLastIsland(key); setRoute({ name: 'island', key }); }}
        onMission={() => setRoute({ name: 'mission' })}
        onSwitch={() => setRoute({ name: 'who' })}
        onGrownUps={() => setGate(true)}
      />
    );
  } else if (route.name === 'island') {
    body = <IslandMenu island={route.key} profile={profile} theme={theme} onPlay={(appId) => { setLastIsland(route.key); setRoute({ name: 'play', appId, from: route.key }); }} onBack={back} />;
  } else if (route.name === 'mission') {
    body = <Mission profile={profile} theme={theme} onExit={() => setRoute({ name: 'hub' })} />;
  } else {
    const App = appById(route.appId)!.component;
    body = (
      <Suspense fallback={<div className="screen"><h1>Loading…</h1></div>}>
        <App key={route.appId} profile={profile} theme={theme} onExit={back} />
      </Suspense>
    );
  }

  const playing = profile && route.name !== 'who' && route.name !== 'parent' && !gate;
  return (
    <div className={`app theme-${theme.id}${route.name === 'parent' ? ' light' : ''}`}>
      {route.name !== 'parent' && <Scenery themeId={theme.id} />}
      <div id="stage" className="stage-canvas">
        <div className="stage-safe-area">
          {body}
        </div>
      </div>
      {playing && <TimeGuard profile={profile} onGrownUps={() => setGate(true)} onSwitch={() => setRoute({ name: 'who' })} />}
      {gate && <Gate onCancel={() => setGate(false)} onPass={() => { setGate(false); setRoute({ name: 'parent' }); }} />}
    </div>
  );
}
