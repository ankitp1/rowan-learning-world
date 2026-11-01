import { Suspense, useRef, useState } from 'react';
import { awardStars, awardSticker, buildMission, countMission } from '../core/engine';
import { APPS, appById } from '../core/registry';
import { sfx, speak } from '../core/speech';
import type { Profile, RoundResult, Theme } from '../core/types';
import { Confetti, HelperAvatar } from '../ui/Art';

/** A mission: 5 short activities, then a treasure chest. */
export default function Mission({ profile, theme, onExit }: { profile: Profile; theme: Theme; onExit: () => void }) {
  const plan = useRef(buildMission(profile, APPS)).current;
  const name = useRef(theme.missionNames[Math.floor(Math.random() * theme.missionNames.length)]).current;
  const [step, setStep] = useState(-1);
  const [correct, setCorrect] = useState(0);
  const [prize, setPrize] = useState<string | undefined | null>(null);
  const [opened, setOpened] = useState(false);
  const rewarded = useRef(false);

  if (!plan.length) {
    return (
      <div className="screen mission">
        <h1>No activities are turned on.</h1>
        <p>Ask a grown-up to switch some on in Grown-ups mode.</p>
        <button className="btn primary" data-autofocus onClick={onExit}>Back</button>
      </div>
    );
  }

  const done = step >= plan.length;
  const finishStep = (r: RoundResult) => { setCorrect((c) => c + r.correct); setStep((s) => s + 1); };

  const openChest = () => {
    if (rewarded.current) return;
    rewarded.current = true;
    awardStars(profile.id, 3);
    const won = awardSticker(profile, theme.stickers);
    if (!won) countMission(profile.id);
    setPrize(won);
    setOpened(true);
    sfx.chest();
    void speak('You finished the mission! Look what you found!');
  };

  if (step === -1) {
    return (
      <div className="screen mission intro">
        <HelperAvatar theme={theme} size={150} talking />
        <h1>{name}</h1>
        <p>{theme.helper.name} needs your help! {plan.length} quick jobs to do.</p>
        <div className="row">
          <button className="btn primary big" data-autofocus onClick={() => { setStep(0); void speak(`${name}. Let's go!`); }}>Let's go!</button>
          <button className="btn" onClick={onExit}>Not now</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="screen mission finale">
        <h1>{name}</h1>
        <p>Mission complete! You got {correct} answers right.</p>
        {!opened ? (
          <button className="chest-btn" data-autofocus onClick={openChest} aria-label="Open the treasure chest">
            <span className="big-emoji shake">{theme.container.emoji}</span>
            <span>Open the {theme.container.name}!</span>
          </button>
        ) : (
          <div className="prize">
            <Confetti count={60} />
            <div className="big-emoji pop">{prize ?? '⭐'}</div>
            <p>{prize ? 'New sticker for your book!' : 'Your sticker book is full. Wow!'} +3 ⭐</p>
            <div className="row">
              <button className="btn primary" data-autofocus onClick={onExit}>Back to the map</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const app = appById(plan[step])!;
  const App = app.component;
  return (
    <div className="mission-run">
      <div className="mission-bar" aria-label={`activity ${step + 1} of ${plan.length}`}>
        <span>{name}</span>
        <div className="pips">{plan.map((_, i) => <i key={i} className={i < step ? 'used' : i === step ? 'now' : ''} />)}</div>
      </div>
      <Suspense fallback={<div className="screen"><h1>Loading…</h1></div>}>
        <App key={`${step}-${app.id}`} profile={profile} theme={theme} rounds={3} onExit={onExit} onComplete={finishStep} />
      </Suspense>
    </div>
  );
}
