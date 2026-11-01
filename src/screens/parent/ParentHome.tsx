import { useState } from 'react';
import { applyMergedDB, deleteProfile, getDB, patchProfile, update, uid, useDB, type DB } from '../../core/db';
import { mergeDB, pullAndMergeNow, setSyncCode, useSyncStatus } from '../../core/sync';
import { THEMES } from '../../core/themes';
import { hashPin } from '../../core/time';
import { AVATARS, ProfileForm } from '../WhoPlaying';
import Controls from './Controls';
import ReportView from './ReportView';

type Tab = 'report' | 'controls' | 'players';

function Players({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const db = useDB();
  const sync = useSyncStatus();
  const [adding, setAdding] = useState(false);
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const [codeInput, setCodeInput] = useState(sync.code);
  const [syncMsg, setSyncMsg] = useState('');
  const changePin = async () => {
    if (!/^\d{4}$/.test(pin)) { setMsg('PIN must be 4 digits.'); return; }
    const salt = uid();
    const h = await hashPin(pin, salt);
    update((d) => { d.parent = { pinHash: h, salt, updatedAt: Date.now() }; });
    setPin(''); setMsg('PIN changed.');
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(getDB(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rowan-learning-world-${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as DB;
        const merged = mergeDB(getDB(), parsed);
        applyMergedDB(merged);
        void pullAndMergeNow();
        setSyncMsg('Backup merged and synced!');
      } catch {
        setSyncMsg('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };
  const applyCode = () => {
    if (setSyncCode(codeInput)) {
      setSyncMsg('Switched sync code and syncing now…');
    } else {
      setSyncMsg('Sync code must be at least 8 letters/numbers.');
    }
  };
  const statusBadge = {
    synced: '🟢 Synced across devices',
    syncing: '🔄 Syncing…',
    offline: '🟡 Offline (will sync when online)',
    error: `🔴 Sync error: ${sync.error ?? 'check connection'}`,
    idle: '⚪ Local mode',
  }[sync.state];

  return (
    <div className="controls">
      <section className="ctl">
        <h3>☁️ Cloud Sync Across Devices</h3>
        <p className="small">
          Status: <b>{statusBadge}</b>
          {sync.lastSyncedAt ? ` · Last synced ${new Date(sync.lastSyncedAt).toLocaleTimeString()}` : ''}
        </p>
        <p className="small">
          Every phone, laptop and TV using the same <b>Family Sync Code</b> automatically shares players, levels, stars and reports in real time.
        </p>
        <div className="row wrap">
          <label>
            Family Sync Code{' '}
            <input
              value={codeInput}
              maxLength={32}
              onChange={(e) => setCodeInput(e.target.value)}
              aria-label="Family Sync Code"
            />
          </label>
          <button className="btn" onClick={applyCode}>Save code</button>
          <button className="btn" onClick={() => void pullAndMergeNow()}>🔄 Sync now</button>
        </div>
        {syncMsg && <p className="small">{syncMsg}</p>}
      </section>
      <section className="ctl">
        <h3>Players</h3>
        {db.profiles.map((p) => (
          <div key={p.id} className="player-row">
            <button className="mini" onClick={() => onSelect(p.id)}>{p.id === selectedId ? '✔ Selected' : 'Select'}</button>
            <select value={p.avatar} onChange={(e) => patchProfile(p.id, (x) => { x.avatar = e.target.value; })} aria-label="avatar">
              {AVATARS.map((a) => <option key={a}>{a}</option>)}
            </select>
            <input value={p.name} maxLength={16} onChange={(e) => patchProfile(p.id, (x) => { x.name = e.target.value; })} aria-label="name" />
            <select value={p.themeId} onChange={(e) => patchProfile(p.id, (x) => { x.themeId = e.target.value; })} aria-label="theme">
              {THEMES.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
            </select>
            <button className="mini danger" onClick={() => { if (window.confirm(`Delete ${p.name} and all their progress?`)) deleteProfile(p.id); }}>Delete</button>
          </div>
        ))}
        {adding ? <ProfileForm onCreated={(id) => { setAdding(false); onSelect(id); }} onCancel={() => setAdding(false)} /> : <button className="btn" onClick={() => setAdding(true)}>➕ Add player</button>}
      </section>
      <section className="ctl">
        <h3>Grown-up PIN</h3>
        <label>New PIN <input inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /></label>
        <button className="btn" onClick={() => void changePin()}>Change PIN</button>
        {msg && <span className="small"> {msg}</span>}
      </section>
      <section className="ctl">
        <h3>Backup & Restore</h3>
        <p className="small">Download a JSON backup or merge a backup file from another device.</p>
        <div className="row wrap">
          <button className="btn" onClick={exportData}>⬇ Export all data (JSON)</button>
          <label className="btn">
            ⬆ Import backup (JSON)
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} />
          </label>
        </div>
      </section>
    </div>
  );
}

export default function ParentHome({ initialProfileId, onExit, onPlacement }: {
  initialProfileId?: string; onExit: () => void; onPlacement: (profileId: string) => void;
}) {
  const db = useDB();
  const [tab, setTab] = useState<Tab>('report');
  const [sel, setSel] = useState(initialProfileId ?? db.profiles[0]?.id ?? '');
  const profile = db.profiles.find((p) => p.id === sel) ?? db.profiles[0];
  return (
    <div className="screen parent">
      <header className="topbar no-print">
        <button className="back" onClick={onExit} aria-label="Back">⬅</button>
        <h2>🔒 Grown-ups</h2>
        <nav className="tabs">
          {([['report', "📊 Captain's Report"], ['controls', '⚙️ Controls'], ['players', '👥 Players & data']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} className={`btn${tab === k ? ' primary' : ''}`} data-autofocus={k === tab ? '' : undefined} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>
      </header>
      <div className="parent-body">
        {!profile ? <p>No players yet. Add one from the “Who’s playing?” screen.</p> : (
          <>
            {db.profiles.length > 1 && tab !== 'players' && (
              <div className="row wrap no-print">
                {db.profiles.map((p) => <button key={p.id} className={`btn${p.id === profile.id ? ' primary' : ''}`} onClick={() => setSel(p.id)}>{p.avatar} {p.name}</button>)}
              </div>
            )}
            {tab === 'report' && <ReportView profiles={db.profiles} selected={profile} />}
            {tab === 'controls' && <Controls profile={profile} onPlacement={() => onPlacement(profile.id)} />}
            {tab === 'players' && <Players selectedId={profile.id} onSelect={setSel} />}
          </>
        )}
      </div>
    </div>
  );
}
