import { useEffect, useState } from 'react';
import { sfx, speak, speakThemeGreeting, stopSpeaking } from '../core/speech';
import type { Profile, Theme } from '../core/types';
import { HelperAvatar } from './Art';
import { useBackHandler } from '../core/nav';

interface WelcomeTourProps {
  theme: Theme;
  childName: string;
  profile?: Profile;
  onFinish: () => void;
  onStartMission?: () => void;
}

interface RealmInfo {
  id: string;
  category: string;
  name: string;
  emoji: string;
  summary: string;
  chips: string[];
  speech: string;
}

function getChildRole(themeId: string): string {
  switch (themeId) {
    case 'space-ranger': return 'Star Fleet Cadet';
    case 'pirate': return 'High Seas Captain';
    case 'dino': return 'Dino Valley Pathfinder';
    case 'western': return 'Frontier Deputy';
    case 'pups': return 'Rescue Pup Leader';
    case 'rescue': return 'Sanctuary Ranger';
    case 'super': return 'Super Hero Scout';
    default: return 'World Adventurer';
  }
}

function getAgeDescription(age: number): { badge: string; desc: string } {
  switch (age) {
    case 3:
      return {
        badge: 'Preschool Explorer · Age 3',
        desc: 'Gentle alphabet sounds, color counting, and toddler-pace exploration.',
      };
    case 4:
      return {
        badge: 'Pre-K Adventurer · Age 4',
        desc: 'Rhyme matching, counting to 10, letter tracing, and early phonics.',
      };
    case 5:
      return {
        badge: 'Kindergarten Pioneer · Age 5',
        desc: 'Sounding out CVC words, number bonds, making 10, and story clues.',
      };
    case 6:
      return {
        badge: '1st Grade Explorer · Age 6',
        desc: 'Sight words, mental math strategies, world flags, and detective mysteries.',
      };
    case 7:
      return {
        badge: '2nd Grade Navigator · Age 7',
        desc: 'Fluent reading, double-digit math, capital cities, and puzzle codes.',
      };
    default:
      return {
        badge: 'Master Scholar · Age 8+',
        desc: 'Advanced comprehension, mental math challenges, world trivia, and logic.',
      };
  }
}

export function WelcomeTourModal({
  theme,
  childName,
  profile,
  onFinish,
  onStartMission,
}: WelcomeTourProps) {
  const [step, setStep] = useState(0);
  const [selectedRealm, setSelectedRealm] = useState<number>(0);

  const age = profile?.age ?? 6;
  const avatar = profile?.avatar ?? '🧒';
  const role = getChildRole(theme.id);
  const ageInfo = getAgeDescription(age);

  useBackHandler(() => {
    onFinish();
    return true;
  }, true);

  // Play opening chime and theme companion greeting when tour opens
  useEffect(() => {
    sfx.good();
    const name = childName?.trim() || profile?.name?.trim() || 'Rowan';
    const fallback = `Welcome to your learning world, ${role} ${name}! I am ${theme.helper.name}, your companion! Let's get ready for your mission!`;
    void speakThemeGreeting(theme.id, name, fallback);
    return () => {
      stopSpeaking();
    };
  }, [theme.id, childName, profile?.name, role]);

  const realms: RealmInfo[] = [
    {
      id: 'reading',
      category: 'Reading & Words',
      name: theme.islands.reading,
      emoji: theme.islandEmoji.reading,
      summary: 'Sound out words, solve rhyming puzzles, sight words, and reading comprehension.',
      chips: ['Word Builder', 'Rhyme Ropes', 'Story Quests'],
      speech: `In ${theme.islands.reading}, you will sound out letters, build words, and unlock stories!`,
    },
    {
      id: 'math',
      category: 'Math & Numbers',
      name: theme.islands.math,
      emoji: theme.islandEmoji.math,
      summary: 'Number bonds to 10, mental math strategies, coin counting, and number mazes.',
      chips: ['Bridge of 10', 'Star Coins', 'Number Maze'],
      speech: `In ${theme.islands.math}, build bridges of 10, count treasure coins, and practice quick mental math!`,
    },
    {
      id: 'mystery',
      category: 'Mystery & Logic',
      name: `${theme.mystery.name} & ${theme.brain.name}`,
      emoji: `${theme.mystery.emoji}`,
      summary: 'Read detective clues, crack secret codes, test memory patterns, and solve puzzles.',
      chips: ['Detective Clues', 'Code Breaker', 'Memory Echo'],
      speech: `In ${theme.mystery.name}, follow detective clues and solve secret cases!`,
    },
    {
      id: 'games',
      category: 'World & Games',
      name: theme.islands.games,
      emoji: theme.islandEmoji.games,
      summary: 'Explore world flags, capital cities, complete missing flag emblems, and play 2-player trivia.',
      chips: ['Flags & Capitals', 'Complete the Flag', 'Where in the World?'],
      speech: `In ${theme.islands.games}, travel the world, complete flags, and explore monuments!`,
    },
  ];

  const handleNextStep = () => {
    sfx.tap();
    stopSpeaking();
    const next = step + 1;
    setStep(next);

    if (next === 1) {
      void speak(`Here are your four learning realms! Tap any realm to preview what we will explore!`);
    } else if (next === 2) {
      void speak(
        `You have two great superpowers: you can speak your answers aloud, and you always get friendly hints!`
      );
    } else if (next === 3) {
      sfx.chest();
      void speak(
        `All systems are green! You are ready to launch! Start today's mission, or explore the open map!`
      );
    }
  };

  const handlePrevStep = () => {
    sfx.tap();
    stopSpeaking();
    if (step > 0) setStep(step - 1);
  };

  const handleSelectRealm = (index: number) => {
    sfx.tap();
    stopSpeaking();
    setSelectedRealm(index);
    void speak(realms[index].speech);
  };

  const handleLaunchMission = () => {
    sfx.star();
    stopSpeaking();
    if (onStartMission) {
      onStartMission();
    } else {
      onFinish();
    }
  };

  const handleOpenMap = () => {
    sfx.tap();
    stopSpeaking();
    onFinish();
  };

  const stepLabels = ['Explorer ID', 'Themed Realms', 'Superpowers', 'Launchpad'];

  return (
    <div className="overlay welcome-tour-overlay" role="dialog" aria-modal="true">
      <div className="card welcome-tour-modern pop">
        {/* Top Header Bar */}
        <div className="tour-modern-header">
          <div className="tour-header-left">
            <span className="tour-avatar-pill">
              <span className="tour-avatar-emoji">{avatar}</span>
              <b>{childName}</b>
              <span className="tour-role-badge">{role}</span>
            </span>
          </div>

          <div className="tour-step-pills">
            {stepLabels.map((lbl, idx) => (
              <button
                type="button"
                key={lbl}
                className={`tour-step-pill${idx === step ? ' active' : ''}${idx < step ? ' completed' : ''}`}
                onClick={() => {
                  sfx.tap();
                  setStep(idx);
                }}
                aria-label={`Step ${idx + 1}: ${lbl}`}
              >
                <span className="step-num">{idx + 1}</span>
                <span className="step-name">{lbl}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="tour-skip-pill"
            onClick={handleOpenMap}
            aria-label="Skip onboarding guide"
          >
            ⚡ Jump In
          </button>
        </div>

        {/* Step 1: Explorer Identity & Companion Briefing */}
        {step === 0 && (
          <div className="tour-step-view tour-step-identity">
            <div className="tour-hero-banner">
              <div className="tour-companion-stage">
                <HelperAvatar theme={theme} size={90} talking />
                <div className="tour-companion-quote">
                  <span className="quote-speaker">{theme.helper.name} · {theme.helper.role}</span>
                  <p className="quote-text">
                    "Welcome to your adventure, <b>{childName}</b>! I am calibrated and ready to explore by your side."
                  </p>
                </div>
              </div>
            </div>

            <div className="tour-id-card">
              <div className="tour-id-passport">
                <div className="id-avatar-box">
                  <span className="id-avatar">{avatar}</span>
                  <span className="id-level-star">⭐</span>
                </div>
                <div className="id-details">
                  <div className="id-title-row">
                    <h3>{childName}</h3>
                    <span className="id-tag">{role}</span>
                  </div>
                  <div className="id-age-badge">
                    <span>🎂</span>
                    <b>{ageInfo.badge}</b>
                  </div>
                  <p className="id-desc">{ageInfo.desc}</p>
                </div>
              </div>

              <div className="tour-features-row">
                <div className="tour-mini-feature">
                  <span className="mf-icon">🎯</span>
                  <div>
                    <b>Smart Adaptive Levels</b>
                    <small>Difficulty grows automatically with every win</small>
                  </div>
                </div>
                <div className="tour-mini-feature">
                  <span className="mf-icon">🛡️</span>
                  <div>
                    <b>Gentle Encouragement</b>
                    <small>No penalties or stress—just stars and fun</small>
                  </div>
                </div>
                <div className="tour-mini-feature">
                  <span className="mf-icon">🔒</span>
                  <div>
                    <b>Parent Control Center</b>
                    <small>Adjust timer and levels anytime in Grown-ups</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Themed Realms Interactive Preview */}
        {step === 1 && (
          <div className="tour-step-view tour-step-realms">
            <div className="tour-step-heading">
              <h2>🗺️ Your Themed Learning Realms</h2>
              <p>Every realm is customized for {theme.name}! Tap any realm to preview what you will discover.</p>
            </div>

            <div className="tour-realms-grid">
              {realms.map((r, idx) => {
                const isSelected = selectedRealm === idx;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`tour-realm-card${isSelected ? ' selected' : ''}`}
                    onClick={() => handleSelectRealm(idx)}
                    aria-pressed={isSelected}
                  >
                    <div className="realm-card-top">
                      <span className="realm-emoji">{r.emoji}</span>
                      <span className="realm-cat-pill">{r.category}</span>
                    </div>
                    <h3 className="realm-name">{r.name}</h3>
                    <p className="realm-summary">{r.summary}</p>
                    <div className="realm-chips">
                      {r.chips.map((c) => (
                        <span key={c} className="realm-chip">{c}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Superpowers (Voice & Smart Help) */}
        {step === 2 && (
          <div className="tour-step-view tour-step-superpowers">
            <div className="tour-step-heading">
              <h2>✨ Two Superpowers for {childName}</h2>
              <p>Designed for effortless exploring with remotes, voice, or touch screens.</p>
            </div>

            <div className="tour-superpowers-grid">
              <div className="superpower-card voice-card">
                <div className="superpower-icon-glow">
                  <span className="sp-icon">🎙️</span>
                </div>
                <h3>Superpower 1: Just Say It!</h3>
                <p>
                  No typing required. Tap <b>"🎤 Say it"</b> or use your TV remote microphone to speak answers aloud!
                </p>
                <div className="sp-tips-box">
                  <span className="sp-tip-pill">"Option A"</span>
                  <span className="sp-tip-pill">"Seven"</span>
                  <span className="sp-tip-pill">"Help me"</span>
                  <span className="sp-tip-pill">"Say again"</span>
                </div>
              </div>

              <div className="superpower-card coach-card">
                <div className="superpower-icon-glow coach-glow">
                  <span className="sp-icon">💡</span>
                </div>
                <h3>Superpower 2: Strategy Coach</h3>
                <p>
                  Whenever a question feels tricky, tap <b>"💡 Hint"</b>. {theme.helper.name} provides visual ten-frames,
                  phonics breakdowns, and flag hints!
                </p>
                <div className="sp-highlight-box">
                  <span>⭐ 100% encouragement · Zero penalties · Take all the time you need</span>
                </div>
              </div>

              <div className="superpower-card coop-card">
                <div className="superpower-icon-glow coop-glow">
                  <span className="sp-icon">👥</span>
                </div>
                <h3>Family Multi-Player</h3>
                <p>
                  Challenge siblings or parents in <b>2-Player Wonder Trivia</b> or <b>Flags & Capitals</b>—each player
                  answers at their own calibrated age!
                </p>
                <div className="sp-highlight-box">
                  <span>🏆 Fair, balanced turns for ages 3 to adult</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Launchpad (Direct Action) */}
        {step === 3 && (
          <div className="tour-step-view tour-step-launchpad">
            <div className="launchpad-hero">
              <div className="launchpad-stars-burst">✨ 🌟 🚀 🌟 ✨</div>
              <h2>You're Cleared for Departure, {role}!</h2>
              <p className="launchpad-sub">
                Your first adventure awaits in <b>{theme.name}</b>. How would you like to start?
              </p>
            </div>

            <div className="launchpad-actions">
              <button
                type="button"
                className="btn primary big launch-mission-btn"
                data-autofocus
                onClick={handleLaunchMission}
              >
                <span className="btn-icon">🚀</span>
                <span className="btn-content">
                  <b>Start Today's Daily Mission</b>
                  <small>3 quick adaptive challenges · Earn your first ⭐ star!</small>
                </span>
              </button>

              <button
                type="button"
                className="btn big launch-map-btn"
                onClick={handleOpenMap}
              >
                <span className="btn-icon">🗺️</span>
                <span className="btn-content">
                  <b>Explore the World Map</b>
                  <small>Roam freely across all 5 themed islands and games</small>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Controls */}
        <div className="tour-modern-footer">
          {step > 0 ? (
            <button
              type="button"
              className="btn tour-back-btn"
              onClick={handlePrevStep}
            >
              ⬅️ Back
            </button>
          ) : (
            <div />
          )}

          <div className="tour-footer-dots">
            {stepLabels.map((_, idx) => (
              <span
                key={idx}
                className={`tour-dot${idx === step ? ' active' : ''}`}
                onClick={() => setStep(idx)}
              />
            ))}
          </div>

          {step < 3 ? (
            <button
              type="button"
              className="btn primary big tour-next-btn"
              data-autofocus
              onClick={handleNextStep}
            >
              {step === 2 ? 'Review Launchpad 🚀' : 'Next Step ➡️'}
            </button>
          ) : (
            <button
              type="button"
              className="btn primary big"
              onClick={handleLaunchMission}
            >
              Let's Go! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
