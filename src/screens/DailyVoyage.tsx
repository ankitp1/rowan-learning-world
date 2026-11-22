import { Suspense, useMemo, useRef, useState } from 'react';
import { awardStars } from '../core/engine';
import { appById } from '../core/registry';
import { sfx, speak, speakThemePraise, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Profile, RoundResult, Theme } from '../core/types';
import { getTodayRoutine, isVoyageUnlocked, unlockVoyageToday } from '../core/voyage';
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
  const [track, setTrack] = useState<'reading' | 'math' | null>(initialTrack ?? null);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const alreadyUnlocked = isVoyageUnlocked(profile.id);

  const activeAppId = track === 'reading' ? routine.reading.appId : track === 'math' ? routine.math.appId : null;
  const activeApp = activeAppId ? appById(activeAppId) : null;

  const startTrack = (chosenTrack: 'reading' | 'math') => {
    stopSpeaking();
    setResult(null);
    setTrack(chosenTrack);
    const chosen = chosenTrack === 'reading' ? routine.reading : routine.math;
    void speak(`Starting ${chosen.title}! Get 5 out of 5 to unlock the games!`);
  };

  const handleComplete = (r: RoundResult) => {
    setResult(r);
    stopSpeaking();
    if (r.correct === r.total) {
      sfx.chest();
      awardStars(profile.id, 5);
      unlockVoyageToday(profile.id);
      void speakThemePraise(theme, undefined, profile.name).then(() => {
        void speak(`Incredible! 5 out of 5! The Games Island is unlocked for today!`);
      });
    } else {
      sfx.soft();
      void speak(`Good effort, ${profile.name}! You got ${r.correct} of ${r.total}. Let's try again for 5 out of 5!`);
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
  if (result && track) {
    const won = result.correct === result.total;
    const currentTrackInfo = track === 'reading' ? routine.reading : routine.math;
    const otherTrack = track === 'reading' ? 'math' : 'reading';
    const otherTrackInfo = otherTrack === 'reading' ? routine.reading : routine.math;

    return (
      <div className={`screen mission finale theme-${theme.id}`}>
        {won && <Confetti />}
        <HelperAvatar theme={theme} size={130} mood={won ? 'cheer' : 'talking'} />
        <div className="card text-center" style={{ maxWidth: '640px', margin: '16px auto', padding: '24px' }}>
          <div className="big-emoji">{won ? '🌟🎉' : '💪'}</div>
          <h1>{won ? '5 out of 5 Perfect!' : `${result.correct} of ${result.total}`}</h1>
          <p style={{ fontSize: '20px', margin: '8px 0 16px' }}>
            {won
              ? `Amazing work, ${profile.name}! You completed today's ${currentTrackInfo.title} and unlocked Games Island! +5 Bonus Stars! ⭐`
              : `So close! You need 5 out of 5 in Reading or Math to unlock Games Island. You can try again right now!`}
          </p>

          <div className="row justify-center gap-12" style={{ flexWrap: 'wrap', marginTop: '16px' }}>
            {won ? (
              <>
                <button className="btn primary big" data-autofocus onClick={onUnlocked}>
                  🎮 Go to Games Island
                </button>
                <button className="btn" onClick={() => startTrack(otherTrack)}>
                  {otherTrackInfo.icon} Do {otherTrackInfo.title} Too
                </button>
                <button className="btn" onClick={onExit}>
                  🗺️ Back to Map
                </button>
              </>
            ) : (
              <>
                <button className="btn primary big" data-autofocus onClick={() => { setRunKey((k) => k + 1); setResult(null); }}>
                  🔁 Try {currentTrackInfo.title} Again
                </button>
                <button className="btn" onClick={() => startTrack(otherTrack)}>
                  {otherTrackInfo.icon} Switch to {otherTrackInfo.title}
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
  if (track && activeApp) {
    const Comp = activeApp.component;
    const miniAppProps: MiniAppProps = {
      profile,
      theme,
      rounds: 5,
      onExit: () => { setTrack(null); setResult(null); },
      onComplete: handleComplete,
    };

    return (
      <Suspense fallback={<div className="screen"><h1>Loading {activeApp.title}…</h1></div>}>
        <Comp key={`${activeApp.id}-${runKey}`} {...miniAppProps} />
      </Suspense>
    );
  }

  // 3. Selection screen: Pick Reading Track OR Math Track
  return (
    <div className={`screen mission intro theme-${theme.id}`}>
      <header className="topbar" style={{ width: '100%', maxWidth: '880px', margin: '0 auto 12px' }}>
        <button className="back" onClick={onExit} aria-label="Back to Map">⬅</button>
        <h2 style={{ fontSize: '24px' }}>⛵ Daily Voyage: {routine.title}</h2>
        <span className="chip" style={{ fontSize: '16px' }}>⭐ {profile.stars}</span>
      </header>

      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 16px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          {routine.dayName} Daily Voyage
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>
          Get <b>5 out of 5</b> in <b>Reading OR Math</b> to unlock Games Island for today!
        </p>
        {alreadyUnlocked && (
          <div className="chip" style={{ display: 'inline-block', margin: '8px 0', background: '#d4edda', color: '#155724', fontWeight: 'bold' }}>
            🎉 Games Island is already UNLOCKED for today!
          </div>
        )}
      </div>

      <div className="row justify-center gap-20" style={{ maxWidth: '840px', margin: '0 auto 24px', flexWrap: 'wrap' }}>
        {/* Reading Track Option */}
        <button
          className="app-card"
          data-autofocus
          style={{
            flex: '1 1 340px',
            maxWidth: '380px',
            padding: '24px',
            textAlign: 'left',
            borderRadius: '24px',
            border: '3px solid #ffc27a',
            background: 'var(--panel)',
            cursor: 'pointer',
          }}
          onClick={() => startTrack('reading')}
        >
          <div className="row align-center gap-12" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '48px' }}>{routine.reading.icon}</span>
            <div>
              <span className="chip" style={{ fontSize: '13px', background: '#f6d98a', color: '#523c00' }}>
                📖 Reading Track
              </span>
              <h3 style={{ fontSize: '22px', margin: '4px 0 0' }}>{routine.reading.title}</h3>
            </div>
          </div>
          <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 16px' }}>
            {routine.reading.blurb}
          </p>
          <div className="row justify-between align-center">
            <span style={{ fontWeight: 600, fontSize: '15px' }}>🎯 Goal: 5 / 5 correct</span>
            <span className="btn primary" style={{ padding: '8px 18px', fontSize: '16px' }}>
              Start ▶
            </span>
          </div>
        </button>

        {/* Math Track Option */}
        <button
          className="app-card"
          style={{
            flex: '1 1 340px',
            maxWidth: '380px',
            padding: '24px',
            textAlign: 'left',
            borderRadius: '24px',
            border: '3px solid #9fe3b8',
            background: 'var(--panel)',
            cursor: 'pointer',
          }}
          onClick={() => startTrack('math')}
        >
          <div className="row align-center gap-12" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '48px' }}>{routine.math.icon}</span>
            <div>
              <span className="chip" style={{ fontSize: '13px', background: '#9fe3b8', color: '#0f4d2a' }}>
                🔢 Math Track
              </span>
              <h3 style={{ fontSize: '22px', margin: '4px 0 0' }}>{routine.math.title}</h3>
            </div>
          </div>
          <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 16px' }}>
            {routine.math.blurb}
          </p>
          <div className="row justify-between align-center">
            <span style={{ fontWeight: 600, fontSize: '15px' }}>🎯 Goal: 5 / 5 correct</span>
            <span className="btn primary" style={{ padding: '8px 18px', fontSize: '16px' }}>
              Start ▶
            </span>
          </div>
        </button>
      </div>

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
