import { useState } from 'react';
import { frontier } from '../core/engine';
import { patchProfile } from '../core/db';
import { APPS } from '../core/registry';
import { THEMES, themeById } from '../core/themes';
import type { MiniApp, Profile, Subject, Theme } from '../core/types';
import { isVoiceSupported, toggleVoiceListening, useVoice } from '../core/voice';
import { AgeOnboardingModal } from '../ui/AgeOnboarding';
import { HelperAvatar, IslandBase, MapTrail } from '../ui/Art';
import { WelcomeTourModal } from '../ui/WelcomeTour';

const TONE: Record<string, Record<string, string>> = {
  pirate: { reading: '#f6d98a', math: '#ffb3a7', mystery: '#c3aef0', brain: '#9fe3b8', games: '#ffc27a' },
  super: { reading: '#59f0ff', math: '#80ed99', mystery: '#ff7eb6', brain: '#b388ff', games: '#ffd23f' },
  pups: { reading: '#ffd166', math: '#ff758f', mystery: '#a8dadc', brain: '#95d5b2', games: '#ffbe0b' },
  rescue: { reading: '#a7f3d0', math: '#fde68a', mystery: '#f9a8d4', brain: '#c4b5fd', games: '#fdba74' },
};

export type IslandKey = 'reading' | 'math' | 'mystery' | 'brain' | 'games';

export const appsOnIsland = (key: IslandKey, profile: Profile): MiniApp[] =>
  APPS.filter((a) => !profile.settings.disabledApps.includes(a.id)).filter((a) =>
    key === 'mystery' || key === 'brain' ? a.place === key : !a.place && a.subject === (key as Subject));

function StickerBook({ profile, theme, onClose }: { profile: Profile; theme: Theme; onClose: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <h2>📖 Sticker book</h2>
        <div className="stickers">
          {theme.stickers.map((s) => (
            <span key={s} className={`sticker${profile.stickers.includes(s) ? ' got' : ''}`}>{profile.stickers.includes(s) ? s : '❔'}</span>
          ))}
        </div>
        <p>{theme.stickers.filter((s) => profile.stickers.includes(s)).length} of {theme.stickers.length} found. Finish missions to open treasure chests!</p>
        <button className="btn primary" data-autofocus onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function helperGreeting(theme: Theme, name: string): string {
  const role = theme.helper?.role ? ` - ${theme.helper.role}` : '';
  if (theme.id === 'pirate') return `Ahoy, Captain ${name}! I'm Barnaby${role}. The seas look bright and I'm ready to explore with you!`;
  if (theme.id === 'pups') return `Ruff-ruff, Pup Leader ${name}! Pip and Scout are on duty! No puzzle is too big for us!`;
  if (theme.id === 'rescue') return `Welcome back, Ranger ${name}! Luna and Blaze are watching the magical creatures. Ready for a wonder walk?`;
  return `Greetings, Hero ${name}! Bolt and Nova here. Your super brain is charged up and ready!`;
}

/** The map: one island per subject, plus the big "Start mission" button. */
export default function Hub({ profile, theme, onIsland, onMission, onSwitch, onGrownUps }: {
  profile: Profile; theme: Theme;
  onIsland: (k: IslandKey) => void; onMission: () => void; onSwitch: () => void; onGrownUps: () => void;
}) {
  const [book, setBook] = useState(false);
  const [ageModal, setAgeModal] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    // Show on first run or if explicitly opened
    try {
      return !localStorage?.getItem?.(`rlw.tourDone.${profile.id}`);
    } catch {
      return false;
    }
  });
  const voice = useVoice();
  const allowed = THEMES.filter((t) => !profile.settings.allowedThemes.length || profile.settings.allowedThemes.includes(t.id));
  const cycleTheme = () => {
    const i = allowed.findIndex((t) => t.id === theme.id);
    const nxt = allowed[(i + 1) % allowed.length];
    if (nxt) patchProfile(profile.id, (p) => { p.themeId = nxt.id; });
  };
  const islands: { key: IslandKey; name: string; emoji: string }[] = [
    { key: 'reading', name: theme.islands.reading, emoji: theme.islandEmoji.reading },
    { key: 'math', name: theme.islands.math, emoji: theme.islandEmoji.math },
    { key: 'mystery', name: theme.mystery.name, emoji: theme.mystery.emoji },
    { key: 'brain', name: theme.brain.name, emoji: theme.brain.emoji },
    { key: 'games', name: theme.islands.games, emoji: theme.islandEmoji.games },
  ];
  const shown = islands.filter((i) => appsOnIsland(i.key, profile).length);
  void frontier; void themeById;
  return (
    <div className="screen hub">
      <header className="hub-top">
        <button className="chip-btn" onClick={onSwitch}>{profile.avatar} {profile.name}</button>
        <span className="stars-count" aria-label={`${profile.stars} stars`}>⭐ {profile.stars}</span>
        <button className="chip-btn" onClick={() => setBook(true)}>📖 Stickers</button>
        <button className="chip-btn" onClick={() => setShowTour(true)}>💡 Tour</button>
        <button className="chip-btn" onClick={() => setAgeModal(true)}>🎯 Age {profile.age ? (profile.age === 8 ? '8+' : profile.age) : 'Level'}</button>
        {isVoiceSupported() && (
          <button
            className={`chip-btn voice-top${voice.status === 'listening' ? ' listening' : ''}`}
            onClick={toggleVoiceListening}
            aria-label={voice.status === 'listening' ? 'Stop listening' : 'Voice command'}
          >
            {voice.status === 'listening' ? '🎙️ Listening...' : '🎤 Voice'}
          </button>
        )}
        {allowed.length > 1 && <button className="chip-btn" onClick={cycleTheme}>{theme.emoji} Change look</button>}
        <button className="chip-btn lock" onClick={onGrownUps} aria-label="Grown-ups">🔒</button>
      </header>
      <h1 className="map-title">{theme.mapTitle.replace('{name}', profile.name)}</h1>
      <div className="map">
        {theme.decor.map((d, i) => <span key={i} className={`decor d${i}`} aria-hidden>{d}</span>)}
        <div className="hub-helper">
          <HelperAvatar theme={theme} size={114} talking />
          <div className="bubble"><p>{helperGreeting(theme, profile.name)}</p></div>
        </div>
        <button className="mission-btn" data-autofocus onClick={onMission}>
          <span className="m-emoji">{theme.pieces[0]}</span>
          <span>Start a mission!</span>
        </button>
        <div className="islands-wrap">
          <MapTrail themeId={theme.id} />
          <div className="islands">
            {shown.map((i) => (
              <button key={i.key} className={`island ${i.key}`} onClick={() => onIsland(i.key)}>
                <IslandBase themeId={theme.id} tone={TONE[theme.id]?.[i.key] ?? '#f6d98a'} />
                <span className="i-emoji">{i.emoji}</span>
                <span className="i-name">{i.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {book && <StickerBook profile={profile} theme={theme} onClose={() => setBook(false)} />}
      {ageModal && <AgeOnboardingModal profile={profile} onClose={() => setAgeModal(false)} />}
      {showTour && (
        <WelcomeTourModal
          theme={theme}
          childName={profile.name}
          onFinish={() => {
            localStorage.setItem(`rlw.tourDone.${profile.id}`, 'true');
            setShowTour(false);
          }}
        />
      )}
    </div>
  );
}

export function IslandMenu({ island, profile, theme, onPlay, onBack }: {
  island: IslandKey; profile: Profile; theme: Theme; onPlay: (id: string) => void; onBack: () => void;
}) {
  const name = island === 'mystery' ? theme.mystery.name : island === 'brain' ? theme.brain.name : theme.islands[island];
  const emoji = island === 'mystery' ? theme.mystery.emoji : island === 'brain' ? theme.brain.emoji : theme.islandEmoji[island];
  const apps = appsOnIsland(island, profile);
  return (
    <div className="screen island-menu">
      <header className="topbar">
        <button className="back" onClick={onBack} aria-label="Back">⬅</button>
        <h2>{emoji} {name}</h2>
      </header>
      <div className="app-cards">
        {apps.map((a, i) => (
          <button key={a.id} className="app-card" data-autofocus={i === 0 ? '' : undefined} onClick={() => onPlay(a.id)}>
            <span className="a-icon">{a.icon}</span>
            <b>{a.id === 'sneaky-thief' ? `Sneaky ${theme.thief.name[0].toUpperCase()}${theme.thief.name.slice(1)}` : a.title}</b>
            <small>{a.blurb}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
