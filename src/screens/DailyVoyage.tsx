import { Suspense, useEffect, useMemo, useState } from 'react';
import { awardStars } from '../core/engine';
import { appById } from '../core/registry';
import { sfx, speak, speakThemePraise, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Profile, RoundResult, Theme } from '../core/types';
import {
  ALL_VOYAGE_APPS,
  getTodayRoutine,
  getTrackNudge,
  isVoyageUnlocked,
  recordVoyageTrackPick,
  unlockVoyageToday,
} from '../core/voyage';
import { Confetti, HelperAvatar } from '../ui/Art';
import Gate from './parent/Gate';

interface DailyVoyageProps {
  profile: Profile;
  theme: Theme;
  onExit: () => void;
  onUnlocked: () => void;
  initialTrack?: 'reading' | 'math';
}

export default function DailyVoyage({ profile, theme, onExit, onUnlocked, initialTrack }: DailyVoyageProps) {
  const routine = useMemo(() => getTodayRoutine(), []);
  const nudge = useMemo(() => getTrackNudge(profile.id), [profile.id]);
  const [track, setTrack] = useState<'reading' | 'math' | null>(initialTrack ?? null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(() => {
    if (initialTrack === 'reading') return routine.reading.appId;
    if (initialTrack === 'math') return routine.math.appId;
    return null;
  });
  const [result, setResult] = useState<RoundResult | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [showGate, setShowGate] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const alreadyUnlocked = isVoyageUnlocked(profile.id);

  const activeApp = selectedAppId ? appById(selectedAppId) : null;

  const startTrack = (chosenTrack: 'reading' | 'math') => {
    stopSpeaking();
    recordVoyageTrackPick(profile.id, chosenTrack);
    setResult(null);
    setTrack(chosenTrack);
    const appId = chosenTrack === 'reading' ? routine.reading.appId : routine.math.appId;
    setSelectedAppId(appId);
    const chosen = chosenTrack === 'reading' ? routine.reading : routine.math;
    void speak(`Starting ${chosen.title}! Let's do 5 questions!`);
  };

  const startCustomApp = (appId: string, appTrack: 'reading' | 'math') => {
    stopSpeaking();
    recordVoyageTrackPick(profile.id, appTrack);
    setResult(null);
    setTrack(appTrack);
    setSelectedAppId(appId);
    const chosen = appById(appId);
    if (chosen) {
      void speak(`Starting ${chosen.title}! Let's do 5 questions!`);
    }
  };

  const handleRandomSurprise = () => {
    const randomChoice = ALL_VOYAGE_APPS[Math.floor(Math.random() * ALL_VOYAGE_APPS.length)];
    startCustomApp(randomChoice.appId, randomChoice.track);
  };

  const handleComplete = (r: RoundResult) => {
    setResult(r);
    stopSpeaking();
    const isPerfection = r.correct === r.total;
    const isRetryPass = attemptCount >= 2;

    if (isPerfection) {
      sfx.chest();
      awardStars(profile.id, 5);
      unlockVoyageToday(profile.id);
      void speakThemePraise(theme, undefined, profile.name).then(() => {
        void speak(`Incredible! 5 out of 5! The Games Island is unlocked for today! Plus 5 bonus stars!`);
      });
    } else if (isRetryPass) {
      // Rewarding effort and grit: Rowan tried again and didn't give up!
      sfx.star();
      awardStars(profile.id, 2);
      unlockVoyageToday(profile.id);
      void speakThemePraise(theme, undefined, profile.name).then(() => {
        void speak(`Awesome grit, ${profile.name}! You didn't give up and tried again! Games Island is UNLOCKED for today! Plus 2 perseverance stars!`);
      });
    } else {
      sfx.soft();
      void speak(`Great effort, ${profile.name}! You got ${r.correct} of ${r.total}. Let's try again! Practice builds our brain power!`);
    }
  };

  const handleAdultOverride = () => {
    unlockVoyageToday(profile.id);
    setShowGate(false);
    sfx.star();
    void speak('Games Island has been unlocked by a grown-up!');
    onUnlocked();
  };

  // 1. Result screen after finishing the 5 questions
  if (result && activeApp) {
    const isPerfection = result.correct === result.total;
    const isRetryPass = attemptCount >= 2;
    const unlockedNow = isPerfection || isRetryPass;

    return (
      <div className={`screen mission finale theme-${theme.id}`}>
        {unlockedNow && <Confetti />}
        <HelperAvatar theme={theme} size={130} mood={unlockedNow ? 'cheer' : 'talking'} />
        <div className="card text-center" style={{ maxWidth: '640px', margin: '16px auto', padding: '24px' }}>
          <div className="big-emoji">{isPerfection ? '🌟🎉' : isRetryPass ? '💪⭐' : '💪'}</div>
          <h1>
            {isPerfection
              ? '5 out of 5 Perfect!'
              : isRetryPass
              ? 'Super Grit & Effort!'
              : `${result.correct} of ${result.total}`}
          </h1>
          <p style={{ fontSize: '20px', margin: '8px 0 16px' }}>
            {isPerfection
              ? `Amazing work, ${profile.name}! You completed ${activeApp.title} with 5 out of 5 and unlocked Games Island! +5 Bonus Stars! ⭐`
              : isRetryPass
              ? `Awesome perseverance, ${profile.name}! You kept trying and didn't give up! Games Island is UNLOCKED for today! +2 Perseverance Stars! ⭐`
              : `Great effort, ${profile.name}! You got ${result.correct} of ${result.total}. Try again to earn Perseverance Stars and unlock Games Island!`}
          </p>

          <div className="row justify-center gap-12" style={{ flexWrap: 'wrap', marginTop: '16px' }}>
            {unlockedNow ? (
              <>
                <button className="btn primary big" data-autofocus onClick={onUnlocked}>
                  🎮 Go to Games Island
                </button>
                <button className="btn" onClick={() => { setAttemptCount(1); setResult(null); setSelectedAppId(null); setTrack(null); }}>
                  ⛵ Play Another Activity
                </button>
                <button className="btn" onClick={onExit}>
                  🗺️ Back to Map
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn primary big"
                  data-autofocus
                  onClick={() => {
                    setAttemptCount((c) => c + 1);
                    setRunKey((k) => k + 1);
                    setResult(null);
                  }}
                >
                  🔁 Try Again (+2 Grit Stars! ⭐)
                </button>
                <button className="btn" onClick={() => { setAttemptCount(1); setResult(null); setSelectedAppId(null); setTrack(null); }}>
                  Switch Activity
                </button>
                <button className="btn" onClick={() => setShowGate(true)}>
                  🔓 Grown-up Override
                </button>
                <button className="btn" onClick={onExit}>
                  🗺️ Back to Map
                </button>
              </>
            )}
          </div>
        </div>
        {showGate && <Gate onCancel={() => setShowGate(false)} onPass={handleAdultOverride} />}
      </div>
    );
  }

  // 2. Active gameplay of the chosen 5-question app
  if (selectedAppId && activeApp) {
    const Comp = activeApp.component;
    const miniAppProps: MiniAppProps = {
      profile,
      theme,
      rounds: 5,
      onExit: () => { setTrack(null); setSelectedAppId(null); setResult(null); },
      onComplete: handleComplete,
    };

    return (
      <Suspense fallback={<div className="screen"><h1>Loading {activeApp.title}…</h1></div>}>
        <Comp key={`${activeApp.id}-${runKey}`} {...miniAppProps} />
      </Suspense>
    );
  }

  // 3. Selection screen: Free Choice (Fri, Sat, Sun) VS Structured Routine (Mon - Thu)
  return (
    <div className={`screen mission intro theme-${theme.id}`}>
      <header className="topbar" style={{ width: '100%', maxWidth: '980px', margin: '0 auto 12px' }}>
        <button className="back" onClick={onExit} aria-label="Back to Map">⬅</button>
        <h2 style={{ fontSize: '24px' }}>⛵ {routine.title}</h2>
        <span
          className="badge-pill"
          style={{
            background: 'rgba(0,0,0,0.35)',
            color: '#fff',
            fontSize: '15px',
            padding: '4px 14px',
            borderRadius: '20px',
          }}
        >
          ⭐ {profile.stars}
        </span>
      </header>

      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 12px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>
          {routine.title}
        </h1>
        {routine.isFreeChoice ? (
          <p style={{ fontSize: '18px', opacity: 0.9, margin: '2px 0 0' }}>
            Choose any game to complete today's Voyage and unlock Games Island!
          </p>
        ) : (
          <p style={{ fontSize: '18px', opacity: 0.9, margin: '2px 0 0' }}>
            Choose Reading OR Math to complete today's Voyage and unlock Games Island!
          </p>
        )}
        {nudge && (
          <div
            className="badge-pill"
            style={{
              background: '#fef3c7',
              color: '#92400e',
              fontWeight: 600,
              fontSize: '14px',
              padding: '6px 16px',
              margin: '8px auto 4px',
              borderRadius: '18px',
              display: 'inline-flex',
            }}
          >
            💡 {nudge.reason}
          </div>
        )}
        {alreadyUnlocked && (
          <div
            className="badge-pill"
            style={{
              display: 'inline-flex',
              margin: '8px 0',
              background: '#d4edda',
              color: '#155724',
              fontWeight: 'bold',
              padding: '6px 16px',
              fontSize: '14px',
            }}
          >
            🎉 Games Island is already UNLOCKED for today!
          </div>
        )}
      </div>

      {/* --- WEEKEND FREE CHOICE PICKER (Friday, Saturday, Sunday) --- */}
      {routine.isFreeChoice ? (
        <div style={{ maxWidth: '1020px', width: '100%', margin: '0 auto 16px' }}>
          <div className="row justify-between align-center" style={{ marginBottom: '10px', padding: '0 8px' }}>
            <span style={{ fontSize: '17px', fontWeight: 700 }}>Choose any 1 of 10 adventures:</span>
            <button
              className="btn primary"
              style={{ padding: '6px 18px', fontSize: '15px', minHeight: '38px', borderRadius: '20px' }}
              onClick={handleRandomSurprise}
            >
              🎲 Surprise Pick!
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
              padding: '8px 4px',
            }}
          >
            {ALL_VOYAGE_APPS.map((app, idx) => (
              <button
                key={app.appId}
                className="app-card"
                data-autofocus={idx === 0 ? '' : undefined}
                style={{
                  minHeight: 'unset',
                  height: '116px',
                  padding: '12px 10px',
                  textAlign: 'center',
                  borderRadius: '20px',
                  border: app.track === 'reading' ? '3px solid #f6d98a' : '3px solid #9fe3b8',
                  background: 'var(--panel)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxSizing: 'border-box',
                }}
                onClick={() => startCustomApp(app.appId, app.track)}
              >
                <span style={{ fontSize: '38px', lineHeight: 1 }}>{app.icon}</span>
                <b style={{ fontSize: '14px', lineHeight: 1.2, margin: '2px 0 0' }}>{app.title}</b>
                <span
                  className="badge-pill"
                  style={{
                    fontSize: '11px',
                    background: app.track === 'reading' ? '#fef3c7' : '#d1fae5',
                    color: app.track === 'reading' ? '#92400e' : '#065f46',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  {app.track === 'reading' ? '📖 Reading' : '🔢 Math'}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* --- STRUCTURED HABIT ROUTINE (Monday - Thursday) --- */
        <div className="row justify-center gap-20" style={{ maxWidth: '840px', margin: '0 auto 24px', flexWrap: 'wrap' }}>
          {/* Reading Track Option */}
          <button
            className="app-card"
            data-autofocus={!nudge || nudge.recommendedTrack === 'reading'}
            style={{
              flex: '1 1 340px',
              maxWidth: '380px',
              padding: '24px',
              textAlign: 'left',
              borderRadius: '24px',
              border: nudge?.recommendedTrack === 'reading' ? '4px solid #f59e0b' : '3px solid #ffc27a',
              background: 'var(--panel)',
              cursor: 'pointer',
            }}
            onClick={() => startTrack('reading')}
          >
            <div className="row align-center gap-12" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '48px' }}>{routine.reading.icon}</span>
              <div>
                <div className="row align-center gap-6" style={{ justifyContent: 'flex-start' }}>
                  <span className="badge-pill" style={{ fontSize: '12px', background: '#f6d98a', color: '#523c00' }}>
                    📖 Reading Track
                  </span>
                  {nudge?.recommendedTrack === 'reading' && (
                    <span className="badge-pill" style={{ fontSize: '11px', background: '#fef08a', color: '#854d0e', fontWeight: 700 }}>
                      ⭐ Recommended
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '22px', margin: '4px 0 0' }}>{routine.reading.title}</h3>
              </div>
            </div>
            <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 16px' }}>
              {routine.reading.blurb}
            </p>
            <div className="row justify-between align-center">
              <span style={{ fontWeight: 600, fontSize: '15px' }}>🎯 5 questions</span>
              <span className="btn primary" style={{ padding: '8px 18px', fontSize: '16px' }}>
                Start ▶
              </span>
            </div>
          </button>

          {/* Math Track Option */}
          <button
            className="app-card"
            data-autofocus={nudge?.recommendedTrack === 'math'}
            style={{
              flex: '1 1 340px',
              maxWidth: '380px',
              padding: '24px',
              textAlign: 'left',
              borderRadius: '24px',
              border: nudge?.recommendedTrack === 'math' ? '4px solid #10b981' : '3px solid #9fe3b8',
              background: 'var(--panel)',
              cursor: 'pointer',
            }}
            onClick={() => startTrack('math')}
          >
            <div className="row align-center gap-12" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '48px' }}>{routine.math.icon}</span>
              <div>
                <div className="row align-center gap-6" style={{ justifyContent: 'flex-start' }}>
                  <span className="badge-pill" style={{ fontSize: '12px', background: '#9fe3b8', color: '#0f4d2a' }}>
                    🔢 Math Track
                  </span>
                  {nudge?.recommendedTrack === 'math' && (
                    <span className="badge-pill" style={{ fontSize: '11px', background: '#a7f3d0', color: '#065f46', fontWeight: 700 }}>
                      ⭐ Recommended
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '22px', margin: '4px 0 0' }}>{routine.math.title}</h3>
              </div>
            </div>
            <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 16px' }}>
              {routine.math.blurb}
            </p>
            <div className="row justify-between align-center">
              <span style={{ fontWeight: 600, fontSize: '15px' }}>🎯 5 questions</span>
              <span className="btn primary" style={{ padding: '8px 18px', fontSize: '16px' }}>
                Start ▶
              </span>
            </div>
          </button>
        </div>
      )}

      <div className="row justify-center gap-16" style={{ marginTop: 'auto' }}>
        <button className="btn" onClick={() => setShowGate(true)}>
          🔓 Grown-up Override
        </button>
        <button className="btn" onClick={onExit}>
          🗺️ Return to Map
        </button>
      </div>

      {showGate && <Gate onCancel={() => setShowGate(false)} onPass={handleAdultOverride} />}
    </div>
  );
}
