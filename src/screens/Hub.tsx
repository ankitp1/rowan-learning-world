import { useMemo, useRef, useState } from 'react';
import { frontier } from '../core/engine';
import { patchProfile } from '../core/db';
import { APPS } from '../core/registry';
import { speak, speakThemeGreeting } from '../core/speech';
import { THEMES, themeById } from '../core/themes';
import type { MiniApp, Profile, Subject, Theme } from '../core/types';
import { isVoiceSupported, toggleVoiceListening, useVoice } from '../core/voice';
import { focusFirst, useBackHandler } from '../core/nav';
import { AgeOnboardingModal } from '../ui/AgeOnboarding';
import { HelperAvatar, IslandBase, MapTrail } from '../ui/Art';
import { HubOptionsModal } from '../ui/HubOptionsModal';
import { ThemePickerModal } from '../ui/ThemePicker';
import { WelcomeTourModal } from '../ui/WelcomeTour';

const TONE: Record<string, Record<string, string>> = {
  pirate: { reading: '#f6d98a', math: '#ffb3a7', mystery: '#c3aef0', brain: '#9fe3b8', games: '#ffc27a' },
  super: { reading: '#59f0ff', math: '#80ed99', mystery: '#ff7eb6', brain: '#b388ff', games: '#ffd23f' },
  pups: { reading: '#ffd166', math: '#ff758f', mystery: '#a8dadc', brain: '#95d5b2', games: '#ffbe0b' },
  rescue: { reading: '#a7f3d0', math: '#fde68a', mystery: '#f9a8d4', brain: '#c4b5fd', games: '#fdba74' },
  'space-ranger': { reading: '#a855f7', math: '#38ef7d', mystery: '#00f2fe', brain: '#818cf8', games: '#f59e0b' },
  western: { reading: '#f4a261', math: '#e76f51', mystery: '#e9c46a', brain: '#2a9d8f', games: '#e63946' },
  dino: { reading: '#52b788', math: '#f4a261', mystery: '#e76f51', brain: '#74c69d', games: '#b7e4c7' },
};

export type IslandKey = 'reading' | 'math' | 'mystery' | 'brain' | 'games';

export const appsOnIsland = (key: IslandKey, profile: Profile): MiniApp[] =>
  APPS.filter((a) => !profile.settings.disabledApps.includes(a.id)).filter((a) =>
    key === 'mystery' || key === 'brain' ? a.place === key : !a.place && a.subject === (key as Subject));

function StickerBook({ profile, theme, onClose }: { profile: Profile; theme: Theme; onClose: () => void }) {
  useBackHandler(() => {
    onClose();
    return true;
  }, true);

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
  if (theme.id === 'space-ranger') return `Star Command to Ranger ${name}! This is Ranger Buzz. All systems are green and we're ready to fly to learning and beyond!`;
  if (theme.id === 'western') return `Howdy, Deputy ${name}! I'm Sheriff Woody. There's adventure on the trail, and you've got a true friend in me!`;
  if (theme.id === 'dino') return `Roar! I mean... hello, Explorer ${name}! I'm Rex. I'm so excited to explore the prehistoric valley with you!`;
  return `Greetings, Hero ${name}! Bolt and Nova here. Your super brain is charged up and ready!`;
}

/** The map: one island per subject, plus the big "Start mission" button. */
export default function Hub({ profile, theme, lastIsland, onIsland, onMission, onSwitch, onGrownUps }: {
  profile: Profile; theme: Theme;
  lastIsland?: IslandKey;
  onIsland: (k: IslandKey) => void; onMission: () => void; onSwitch: () => void; onGrownUps: () => void;
}) {
  const [book, setBook] = useState(false);
  const [ageModal, setAgeModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDwell = (text: string) => {
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
    dwellTimer.current = setTimeout(() => {
      void speak(text);
    }, 500);
  };

  const onLeave = () => {
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
  };
  const [showTour, setShowTour] = useState(() => {
    // Show on first run or if explicitly opened
    try {
      return !localStorage?.getItem?.(`rlw.tourDone.${profile.id}`);
    } catch {
      return false;
    }
  });
  const voice = useVoice();

  // Auto-upgrade profiles so new themes (space-ranger, western, dino) are instantly accessible:
  const allowed = useMemo(() => {
    const custom = profile.settings?.allowedThemes ?? [];
    if (!custom.length) return THEMES;
    const legacyThemes = ['pirate', 'super', 'pups', 'rescue'];
    if (custom.every((id) => legacyThemes.includes(id)) && custom.length === legacyThemes.length) {
      return THEMES;
    }
    const filtered = THEMES.filter((t) => custom.includes(t.id));
    return filtered.length > 0 ? filtered : THEMES;
  }, [profile.settings?.allowedThemes]);

  const selectTheme = (themeId: string) => {
    patchProfile(profile.id, (p) => {
      p.themeId = themeId;
      // If allowedThemes had legacy values, make sure the chosen theme is unlocked
      if (p.settings.allowedThemes?.length && !p.settings.allowedThemes.includes(themeId)) {
        p.settings.allowedThemes = [];
      }
    });
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
        <div className="hub-top-group left">
          <button className="chip-btn profile-chip" onClick={onSwitch} aria-label={`Player: ${profile.name}, tap to switch player`}>
            <span className="chip-avatar">{profile.avatar}</span>
            <span className="chip-name">{profile.name}</span>
          </button>
          <button className="chip-btn stars-chip" onClick={() => setBook(true)} aria-label={`${profile.stars} stars, tap to view sticker album`}>
            ⭐ {profile.stars}
          </button>
        </div>

        <div className="hub-top-group right">
          {isVoiceSupported() && (
            <button
              className={`chip-btn icon-chip voice-top${voice.status === 'listening' ? ' listening' : ''}`}
              onClick={toggleVoiceListening}
              aria-label={voice.status === 'listening' ? 'Stop listening' : 'Voice command'}
              title="Voice commands"
            >
              {voice.status === 'listening' ? '🎙️ Listening...' : '🎤 Voice'}
            </button>
          )}
          <button id="hub-menu-btn" className="chip-btn menu-chip" onClick={() => setShowOptions(true)} aria-label="Adventure options and menu">
            ⚙️ Menu
          </button>
          <button className="chip-btn lock" onClick={onGrownUps} aria-label="Grown-ups" title="Parent settings">
            🔒
          </button>
        </div>
      </header>
      {/* Straight-line Two-Tier Layout (Page 5 design spec) */}
      <div className="hub-grid-layout">
        {/* Row 1: Today's Mission Card - Focused by default */}
        <button
          className="hub-mission-card"
          data-autofocus={!lastIsland ? '' : undefined}
          onClick={onMission}
          onFocus={() => onDwell(`Today's Mission: ${theme.mapTitle.replace('{name}', profile.name)}`)}
          onBlur={onLeave}
          aria-label={`Start a mission - Today's Mission: ${theme.mapTitle.replace('{name}', profile.name)}`}
        >
          <div className="mission-art-box">
            <span className="mission-badge-emoji">{theme.pieces[0]}</span>
            <span className="mission-map-icon">🗺️</span>
          </div>
          <div className="mission-details">
            <span className="mission-tag">Today's Mission</span>
            <h2 className="mission-title">{theme.mapTitle.replace('{name}', profile.name)}</h2>
            <div className="mission-dots" aria-label="Activities in this mission">
              <span className="m-dot done"></span>
              <span className="m-dot done"></span>
              <span className="m-dot"></span>
              <span className="m-dot"></span>
            </div>
          </div>
          <div className="mission-play-prompt">
            <span className="play-triangle">▶</span>
            <b>Start a mission</b>
          </div>
        </button>

        {/* Row 2: The Islands in One Straight Row */}
        <div className="hub-islands-row" role="region" aria-label="Islands">
          {shown.map((i) => (
            <button
              key={i.key}
              id={`island-btn-${i.key}`}
              data-autofocus={lastIsland === i.key ? '' : undefined}
              className={`hub-island-tile ${i.key}`}
              onClick={() => onIsland(i.key)}
              onFocus={() => onDwell(`${i.name} Island`)}
              onBlur={onLeave}
              aria-label={`${i.name} Island`}
            >
              <span className="tile-category">{i.key.toUpperCase()}</span>
              <div className="tile-art-wrap">
                <IslandBase themeId={theme.id} tone={TONE[theme.id]?.[i.key] ?? '#f6d98a'} />
                <span className="tile-emoji">{i.emoji}</span>
              </div>
              <span className="tile-title">{i.name}</span>
            </button>
          ))}
        </div>
      </div>
      {book && <StickerBook profile={profile} theme={theme} onClose={() => setBook(false)} />}
      {ageModal && <AgeOnboardingModal profile={profile} onClose={() => setAgeModal(false)} />}
      {showOptions && (
        <HubOptionsModal
          theme={theme}
          profileName={profile.name}
          currentAge={profile.age}
          onOpenThemePicker={() => setShowThemePicker(true)}
          onOpenAgeModal={() => setAgeModal(true)}
          onOpenStickerBook={() => setBook(true)}
          onOpenTour={() => setShowTour(true)}
          onOpenGrownUps={onGrownUps}
          onClose={() => setShowOptions(false)}
        />
      )}
      {showThemePicker && (
        <ThemePickerModal
          currentThemeId={theme.id}
          themes={allowed}
          childName={profile.name}
          onSelect={selectTheme}
          onClose={() => setShowThemePicker(false)}
        />
      )}
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
