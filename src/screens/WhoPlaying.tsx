import { useState } from 'react';
import { createProfile, useDB } from '../core/db';
import { THEMES } from '../core/themes';

export const AVATARS = ['🧒', '👦', '👧', '🧑‍🚀', '🦸', '🦊', '🐯', '🐼', '🦁', '🐲', '🦄', '🐵'];

export function ProfileForm({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel?: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [themeId, setThemeId] = useState(THEMES[0].id);
  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreated(createProfile(name.trim(), avatar, themeId).id);
      }}
    >
      <h2>New player</h2>
      <label>Name <input value={name} onChange={(e) => setName(e.target.value)} maxLength={16} placeholder="Name" data-autofocus /></label>
      <div className="pick">
        {AVATARS.map((a) => (
          <button type="button" key={a} className={`pick-btn${a === avatar ? ' on' : ''}`} onClick={() => setAvatar(a)} aria-label={`avatar ${a}`}>{a}</button>
        ))}
      </div>
      <div className="pick">
        {THEMES.map((t) => (
          <button type="button" key={t.id} className={`pick-btn wide${t.id === themeId ? ' on' : ''}`} onClick={() => setThemeId(t.id)}>
            {t.emoji} {t.name}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn primary" type="submit" disabled={!name.trim()}>Let's go!</button>
        {onCancel && <button className="btn" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

/** "Who's playing?" — avatar + name, no passwords for kids. */
export default function WhoPlaying({ onPick, onGrownUps }: { onPick: (id: string) => void; onGrownUps: () => void }) {
  const db = useDB();
  const [adding, setAdding] = useState(false);
  const first = db.profiles.length === 0;
  return (
    <div className="screen who">
      <h1>{first ? 'Welcome! Who is playing?' : "Who's playing?"}</h1>
      {adding || first ? (
        <ProfileForm onCreated={(id) => { setAdding(false); onPick(id); }} onCancel={first ? undefined : () => setAdding(false)} />
      ) : (
        <div className="profiles">
          {db.profiles.map((p, i) => (
            <button key={p.id} className="profile-btn" data-autofocus={i === 0 ? '' : undefined} onClick={() => onPick(p.id)}>
              <span className="avatar">{p.avatar}</span>
              <span>{p.name}</span>
            </button>
          ))}
          <button className="profile-btn add" onClick={() => setAdding(true)}><span className="avatar">➕</span><span>Add player</span></button>
        </div>
      )}
      <button className="grownups" onClick={onGrownUps}>🔒 Grown-ups</button>
    </div>
  );
}
