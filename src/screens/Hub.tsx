import { useEffect, useMemo, useRef, useState } from 'react';
import { frontier } from '../core/engine';
import { patchProfile } from '../core/db';
import { APPS } from '../core/registry';
import { sfx, speak, speakThemeGreeting, stopSpeaking } from '../core/speech';
import { THEMES, themeById } from '../core/themes';
import type { MiniApp, Profile, Subject, Theme } from '../core/types';
import { isVoiceSupported, toggleVoiceListening, useVoice } from '../core/voice';
import { focusFirst, useBackHandler } from '../core/nav';
import { getTodayRoutine, isVoyageUnlocked, unlockVoyageToday, type DayRoutine } from '../core/voyage';
import { getTodayQuest, isQuestDoneToday } from '../core/realWorldQuests';
import { RealWorldQuestModal } from './RealWorldQuestModal';
import { AgeOnboardingModal } from '../ui/AgeOnboarding';
import { HelperAvatar, IslandBase, MapTrail } from '../ui/Art';
import { HubOptionsModal } from '../ui/HubOptionsModal';
import { ThemePickerModal } from '../ui/ThemePicker';
import { WelcomeTourModal } from '../ui/WelcomeTour';
import Gate from './parent/Gate';

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
export default function Hub({
  profile, theme, lastIsland, onIsland, onMission, onVoyage, onSwitch, onGrownUps,
}: {
  profile: Profile; theme: Theme;
  lastIsland?: IslandKey;
  onIsland: (k: IslandKey) => void;
  onMission: () => void;
  onVoyage: (track?: 'reading' | 'math') => void;
  onSwitch: () => void;
  onGrownUps: () => void;
}) {
  const [book, setBook] = useState(false);
  const [ageModal, setAgeModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [lockedModal, setLockedModal] = useState(false);
  const [showAdultGate, setShowAdultGate] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const routine = useMemo(() => getTodayRoutine(), []);
  const todayQuest = useMemo(() => getTodayQuest(), []);
  const [unlocked, setUnlocked] = useState(() => isVoyageUnlocked(profile.id));
  const [questDone, setQuestDone] = useState(() => isQuestDoneToday(profile.id));
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onUnlockEvent = () => setUnlocked(true);
    const onQuestEvent = () => setQuestDone(true);
    window.addEventListener('voyage:unlocked', onUnlockEvent);
    window.addEventListener('quest:completed', onQuestEvent);
    return () => {
      window.removeEventListener('voyage:unlocked', onUnlockEvent);
      window.removeEventListener('quest:completed', onQuestEvent);
    };
  }, []);

  const handleIslandClick = (key: IslandKey) => {
    if (key === 'games' && !unlocked) {
      setLockedModal(true);
      void speak(`Games Island is locked! Complete 5 out of 5 in today's ${routine.dayName} Voyage to unlock!`);
      return;
    }
    onIsland(key);
  };

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

  // Personal voice greeting from the theme companion when entering the Hub
  useEffect(() => {
    if (showTour) return;
    const key = `rlw.greeted.${profile.id}.${theme.id}`;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        const text = helperGreeting(theme, profile.name);
        void speakThemeGreeting(theme.id, profile.name, text);
      }
    } catch {
      // sessionStorage might fail in restricted environments
    }
  }, [profile.id, theme.id, profile.name, showTour]);

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
    stopSpeaking();
    try {
      sessionStorage.removeItem(`rlw.greeted.${profile.id}.${themeId}`);
    } catch {
      // ignore
    }
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
        {/* Row 1: Today's Daily Voyage Hero Card, Real-World Quest & Adventure Mission Card */}
        <div className="hub-hero-row" style={{ width: '100%', maxWidth: '1460px', display: 'flex', gap: '16px', alignItems: 'stretch' }}>
          <button
            className="hub-mission-card"
            data-autofocus={!lastIsland ? '' : undefined}
            onClick={() => onVoyage()}
            onFocus={() => onDwell(`Today's Voyage: ${routine.dayName}, ${routine.title}`)}
            onBlur={onLeave}
            aria-label={`Today's Voyage: ${routine.dayName}, ${routine.title}`}
            style={{ flex: '2.4 1 0', minWidth: '0' }}
          >
            <div className="mission-art-box">
              <span className="mission-badge-emoji">{routine.reading.icon}</span>
              <span className="mission-map-icon">⛵</span>
            </div>
            <div className="mission-details">
              <div className="row align-center gap-8" style={{ marginBottom: '4px', justifyContent: 'flex-start' }}>
                <span className="mission-tag">⛵ {routine.dayName}'s Daily Voyage</span>
                {unlocked ? (
                  <span className="chip" style={{ background: '#d4edda', color: '#155724', fontSize: '13px', padding: '2px 8px', height: 'auto', minHeight: 'unset' }}>
                    🎉 Games Unlocked
                  </span>
                ) : (
                  <span className="chip" style={{ background: '#fff3cd', color: '#856404', fontSize: '13px', padding: '2px 8px', height: 'auto', minHeight: 'unset' }}>
                    🔒 Play Voyage to Unlock Games
                  </span>
                )}
              </div>
              <h2 className="mission-title">{routine.title}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '16px', opacity: 0.88 }}>
                {routine.tagline} (Choose 📖 <b>{routine.reading.title}</b> or 🔢 <b>{routine.math.title}</b>)
              </p>
            </div>
            <div className="mission-play-prompt">
              <span className="play-triangle">▶</span>
              <b>{unlocked ? 'Play Again' : 'Start Voyage'}</b>
            </div>
          </button>

          <button
            className="hub-mission-card mission-secondary-card"
            onClick={() => setShowQuestModal(true)}
            onFocus={() => onDwell(`Real-World Quest: ${todayQuest.title}`)}
            onBlur={onLeave}
            aria-label={`Real-World Quest: ${todayQuest.title} - Find things at home`}
            style={{
              flex: '1.2 1 240px',
              maxWidth: '340px',
              padding: '18px 20px',
              border: questDone ? '3px solid #86efac' : '3px solid #fde047',
              background: questDone ? 'linear-gradient(175deg, rgba(240, 253, 244, 0.95) 0%, rgba(220, 252, 231, 0.95) 100%)' : undefined,
            }}
          >
            <div className="mission-art-box" style={{ width: '74px', height: '74px' }}>
              <span className="mission-badge-emoji" style={{ fontSize: '36px' }}>{todayQuest.icon}</span>
            </div>
            <div className="mission-details" style={{ textAlign: 'left' }}>
              <div className="row align-center gap-6" style={{ justifyContent: 'flex-start' }}>
                <span className="mission-tag" style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1' }}>
                  🏡 REAL-WORLD
                </span>
                {questDone && (
                  <span className="chip" style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '1px 6px', height: 'auto', minHeight: 'unset' }}>
                    ⭐ Done!
                  </span>
                )}
              </div>
              <h3 style={{ margin: '3px 0 2px', fontSize: '17px', fontWeight: 700 }}>{todayQuest.title}</h3>
              <div className="mission-play-prompt" style={{ padding: '0', background: 'none' }}>
                <b style={{ fontSize: '14px', color: '#0284c7' }}>{questDone ? 'View Quest ▶' : 'Explore Quest ▶'}</b>
              </div>
            </div>
          </button>

          <button
            className="hub-mission-card mission-secondary-card"
            onClick={onMission}
            onFocus={() => onDwell("Start a mission - 5 activities and a treasure chest")}
            onBlur={onLeave}
            aria-label="Start a mission - 5 quick jobs to earn stickers"
            style={{ flex: '1.1 1 220px', maxWidth: '320px', padding: '18px 20px' }}
          >
            <div className="mission-art-box" style={{ width: '74px', height: '74px' }}>
              <span className="mission-badge-emoji" style={{ fontSize: '36px' }}>🗺️</span>
            </div>
            <div className="mission-details" style={{ textAlign: 'left' }}>
              <span className="mission-tag" style={{ fontSize: '11px' }}>★ MISSION</span>
              <h3 style={{ margin: '3px 0 2px', fontSize: '17px', fontWeight: 700 }}>
                {theme.mapTitle.replaceAll('{name}', profile.name || 'Rowan')}
              </h3>
              <div className="mission-play-prompt" style={{ padding: '0', background: 'none' }}>
                <b style={{ fontSize: '14px', color: 'var(--primary)' }}>Start a mission ▶</b>
              </div>
            </div>
          </button>
        </div>

        {/* Row 2: The Islands in One Straight Row */}
        <div className="hub-islands-row" role="region" aria-label="Islands">
          {shown.map((i) => {
            const isLocked = i.key === 'games' && !unlocked;
            return (
              <button
                key={i.key}
                id={`island-btn-${i.key}`}
                data-autofocus={lastIsland === i.key ? '' : undefined}
                className={`hub-island-tile ${i.key}`}
                onClick={() => handleIslandClick(i.key)}
                onFocus={() => onDwell(`${i.name} Island${isLocked ? ' - Locked until 5/5 Voyage complete' : ''}`)}
                onBlur={onLeave}
                aria-label={`${i.name} Island${isLocked ? ', Locked' : ''}`}
              >
                {isLocked && <span className="tile-lock-badge">🔒 5/5 to unlock</span>}
                {i.key === 'games' && unlocked && <span className="tile-unlocked-badge">⭐ Open!</span>}
                <span className="tile-category">{i.key.toUpperCase()}</span>
                <div className="tile-art-wrap">
                  <IslandBase themeId={theme.id} tone={TONE[theme.id]?.[i.key] ?? '#f6d98a'} />
                  <span className="tile-emoji">{i.emoji}</span>
                </div>
                <span className="tile-title">{i.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {lockedModal && (
        <div className="overlay" onClick={() => setLockedModal(false)}>
          <div className="card text-center" style={{ maxWidth: '620px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>🔒🎮</div>
            <h2 style={{ fontSize: '28px', margin: '0 0 8px' }}>Games Island is Locked!</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, margin: '0 0 16px' }}>
              Complete today's <b>{routine.dayName} Voyage</b> with <b>5 out of 5</b> in Reading OR Math to unlock all games!
            </p>

            <div className="row justify-center gap-12" style={{ flexWrap: 'wrap', margin: '16px 0' }}>
              <button
                className="btn primary big"
                data-autofocus
                onClick={() => { setLockedModal(false); onVoyage('reading'); }}
                style={{ flex: '1 1 240px' }}
              >
                {routine.reading.icon} Do Reading: {routine.reading.title} (5/5)
              </button>
              <button
                className="btn primary big"
                onClick={() => { setLockedModal(false); onVoyage('math'); }}
                style={{ flex: '1 1 240px' }}
              >
                {routine.math.icon} Do Math: {routine.math.title} (5/5)
              </button>
            </div>

            <div className="row justify-between align-center" style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
              <button className="btn" style={{ fontSize: '14px', opacity: 0.8 }} onClick={() => setShowAdultGate(true)}>
                🔓 Grown-up Override
              </button>
              <button className="btn" onClick={() => setLockedModal(false)}>
                Back to Map
              </button>
            </div>
          </div>
        </div>
      )}
      {showAdultGate && (
        <Gate
          onCancel={() => setShowAdultGate(false)}
          onPass={() => {
            unlockVoyageToday(profile.id);
            setUnlocked(true);
            setShowAdultGate(false);
            setLockedModal(false);
            sfx.star();
            void speak('Games Island has been unlocked by a grown-up!');
            onIsland('games');
          }}
        />
      )}
      {showQuestModal && (
        <RealWorldQuestModal
          profile={profile}
          theme={theme}
          onClose={() => setShowQuestModal(false)}
        />
      )}
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
          profile={profile}
          onStartMission={() => {
            localStorage.setItem(`rlw.tourDone.${profile.id}`, 'true');
            setShowTour(false);
            onMission();
          }}
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
