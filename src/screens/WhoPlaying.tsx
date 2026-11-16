import { useState } from 'react';
import { addDeviceProfileId, createProfile, getDeviceId, getDeviceProfileIds, useDB } from '../core/db';
import { applyAgeCalibration, defaultStagesForAge } from '../core/engine';
import { THEMES } from '../core/themes';
import type { MathStage, ReadingStage } from '../core/types';
import { AgeStageFields } from '../ui/AgeOnboarding';

export const AVATARS = ['🧒', '👦', '👧', '🧑‍🚀', '🦸', '🦊', '🐯', '🐼', '🦁', '🐲', '🦄', '🐵'];

export function ProfileForm({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel?: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [age, setAge] = useState(5);
  const [readingStage, setReadingStage] = useState<ReadingStage>('phonics');
  const [mathStage, setMathStage] = useState<MathStage>('add10');

  const handleAgeChange = (nextAge: number) => {
    setAge(nextAge);
    const defs = defaultStagesForAge(nextAge);
    setReadingStage(defs.readingStage);
    setMathStage(defs.mathStage);
  };

  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const p = createProfile(name.trim(), avatar, themeId);
        applyAgeCalibration(p.id, { age, readingStage, mathStage });
        onCreated(p.id);
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
      <AgeStageFields
        age={age}
        readingStage={readingStage}
        mathStage={mathStage}
        onAgeChange={handleAgeChange}
        onReadingChange={setReadingStage}
        onMathChange={setMathStage}
      />
      <div className="row">
        <button className="btn primary" type="submit" disabled={!name.trim()}>Let's go!</button>
        {onCancel && <button className="btn" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

/** "Who's playing?" — avatar + name, filtered to this device's profiles with all-family toggle. */
export default function WhoPlaying({ onPick, onGrownUps }: { onPick: (id: string) => void; onGrownUps: () => void }) {
  const db = useDB();
  const [adding, setAdding] = useState(false);
  const [showAllFamily, setShowAllFamily] = useState(false);
  const first = db.profiles.length === 0;

  const deviceProfileIds = getDeviceProfileIds();
  const myDeviceId = getDeviceId();
  // Filter to profiles on this device unless showAllFamily is true, or if no device profiles are configured yet
  const deviceProfiles = db.profiles.filter((p) =>
    deviceProfileIds.length === 0 || deviceProfileIds.includes(p.id) || p.createdOnDeviceId === myDeviceId
  );
  const activeProfiles = showAllFamily || deviceProfiles.length === 0 ? db.profiles : deviceProfiles;
  const hasOtherFamilyProfiles = db.profiles.length > activeProfiles.length;

  const handlePick = (id: string) => {
    addDeviceProfileId(id);
    onPick(id);
  };

  return (
    <div className="screen who">
      <h1>{first ? 'Welcome! Who is playing?' : "Who's playing?"}</h1>
      {adding || first ? (
        <ProfileForm onCreated={(id) => { setAdding(false); handlePick(id); }} onCancel={first ? undefined : () => setAdding(false)} />
      ) : (
        <>
          <div className="profiles">
            {activeProfiles.map((p, i) => (
              <button key={p.id} className="profile-btn" data-autofocus={i === 0 ? '' : undefined} onClick={() => handlePick(p.id)}>
                <span className="avatar">{p.avatar}</span>
                <span>{p.name}</span>
              </button>
            ))}
            <button className="profile-btn add" onClick={() => setAdding(true)}><span className="avatar">➕</span><span>Add player</span></button>
          </div>
          <div className="row justify-center gap-12" style={{ marginTop: '12px' }}>
            {hasOtherFamilyProfiles && (
              <button className="chip-btn" onClick={() => setShowAllFamily(true)}>
                👥 Show all family profiles ({db.profiles.length})
              </button>
            )}
            {showAllFamily && deviceProfiles.length > 0 && deviceProfiles.length < db.profiles.length && (
              <button className="chip-btn" onClick={() => setShowAllFamily(false)}>
                📱 Show this device only ({deviceProfiles.length})
              </button>
            )}
          </div>
        </>
      )}
      <button className="grownups" onClick={onGrownUps}>🔒 Grown-ups</button>
    </div>
  );
}
