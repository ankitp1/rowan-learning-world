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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const handleAgeChange = (nextAge: number) => {
    setAge(nextAge);
    const defs = defaultStagesForAge(nextAge);
    setReadingStage(defs.readingStage);
    setMathStage(defs.mathStage);
  };

  const ageDescriptions: Record<number, string> = {
    3: 'Preschool · Gentle sounds, colors & counting',
    4: 'Pre-K · Rhyming, counting to 10 & early letters',
    5: 'Kindergarten · CVC words, number bonds & adding to 10',
    6: '1st Grade · Phonics, mental math & world geography',
    7: '2nd Grade · Story reading, double-digit math & capitals',
    8: 'Master Explorer · Advanced trivia, math & logic',
  };

  return (
    <form
      className="card form modern-profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const p = createProfile(name.trim(), avatar, themeId);
        applyAgeCalibration(p.id, { age, readingStage, mathStage });
        onCreated(p.id);
      }}
    >
      <div className="profile-form-header">
        <h2>✨ New Explorer Registration</h2>
        <p className="small">Set up a personalized learning world calibrated for your child</p>
      </div>

      {/* Live Passport Preview */}
      <div className="passport-preview-card">
        <span className="pp-avatar">{avatar}</span>
        <div className="pp-info">
          <div className="pp-title">
            <b>{name.trim() || 'New Explorer'}</b>
            <span className="pp-theme-pill">{selectedTheme.emoji} {selectedTheme.name}</span>
          </div>
          <small className="pp-sub">
            Partner: {selectedTheme.helper.name} · {ageDescriptions[age] ?? `Age ${age}`}
          </small>
        </div>
      </div>

      {/* Name Input */}
      <div className="form-group">
        <label className="form-label" htmlFor="player-name-input">
          Child's First Name
        </label>
        <input
          id="player-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="Name"
          className="name-input-modern"
          data-autofocus
        />
      </div>

      {/* Avatar Picker */}
      <div className="form-group">
        <span className="form-label">Choose an Avatar</span>
        <div className="pick avatar-pick-grid">
          {AVATARS.map((a) => (
            <button
              type="button"
              key={a}
              className={`pick-btn avatar-btn${a === avatar ? ' on' : ''}`}
              onClick={() => setAvatar(a)}
              aria-label={`avatar ${a}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Picker */}
      <div className="form-group">
        <span className="form-label">Choose an Adventure World & Companion</span>
        <div className="pick theme-pick-grid">
          {THEMES.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`theme-card-mini${t.id === themeId ? ' on' : ''}`}
              onClick={() => setThemeId(t.id)}
            >
              <span className="tc-emoji">{t.emoji}</span>
              <div className="tc-info">
                <b>{t.name}</b>
                <small>{t.helper.name} ({t.helper.emoji})</small>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Age Picker */}
      <div className="form-group">
        <span className="form-label">Child's Age (Auto-calibrates difficulty)</span>
        <div className="pick age-pick-grid">
          {[3, 4, 5, 6, 7, 8].map((a) => (
            <button
              type="button"
              key={a}
              className={`pick-btn age-pill-btn${age === a ? ' on' : ''}`}
              onClick={() => handleAgeChange(a)}
            >
              {a === 8 ? '8+' : `${a} yrs`}
            </button>
          ))}
        </div>
        <div className="age-context-pill">
          <span>🎂</span>
          <span>{ageDescriptions[age]}</span>
        </div>
      </div>

      {/* Optional Advanced Stages */}
      <div className="form-group">
        <button
          type="button"
          className="btn-link advanced-toggle-btn"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? '▴ Hide Advanced Readiness Stages' : '▾ Customize Reading & Math Stages (Optional)'}
        </button>

        {showAdvanced && (
          <div className="advanced-stages-drawer pop">
            <AgeStageFields
              age={age}
              readingStage={readingStage}
              mathStage={mathStage}
              onAgeChange={handleAgeChange}
              onReadingChange={setReadingStage}
              onMathChange={setMathStage}
            />
          </div>
        )}
      </div>

      <div className="row justify-center gap-12 mt-12">
        <button className="btn primary big" type="submit" disabled={!name.trim()}>
          Let's go! 🚀
        </button>
        {onCancel && (
          <button className="btn big" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
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
