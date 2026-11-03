import { useState } from 'react';
import { patchProfile } from '../core/db';
import { MATH_STAGES, READING_STAGES, applyAgeCalibration, defaultStagesForAge } from '../core/engine';
import type { MathStage, Profile, ReadingStage, TimerMode } from '../core/types';

export const AGES = [3, 4, 5, 6, 7, 8];

export const TIMER_MODES: { id: TimerMode; label: string; desc: string }[] = [
  { id: 'off', label: 'No Timer', desc: 'Take all the time you want (1 ⭐ per answer)' },
  { id: 'auto', label: 'Auto by Difficulty', desc: '30s easy · 22s medium · 15s hard (up to 3 ⭐ speed bonus!)' },
  { id: 'relaxed', label: 'Relaxed (30s)', desc: 'Gentle 25–35s timer with up to 3 ⭐ speed bonus' },
  { id: 'standard', label: 'Standard (18s)', desc: 'Moderate 14–24s timer with up to 3 ⭐ speed bonus' },
  { id: 'fast', label: 'Fast Challenge (12s)', desc: 'Quick 9–16s mental-math challenge with 3 ⭐ rewards' },
];

export function AgeStageFields({
  age,
  readingStage,
  mathStage,
  onAgeChange,
  onReadingChange,
  onMathChange,
}: {
  age: number;
  readingStage: ReadingStage;
  mathStage: MathStage;
  onAgeChange: (age: number) => void;
  onReadingChange: (stage: ReadingStage) => void;
  onMathChange: (stage: MathStage) => void;
}) {
  return (
    <div className="age-onboarding-fields">
      <div className="age-sec">
        <span className="age-label">🎂 How old is your child?</span>
        <div className="pick age-pick">
          {AGES.map((a) => (
            <button
              type="button"
              key={a}
              className={`pick-btn age-btn${age === a ? ' on' : ''}`}
              onClick={() => onAgeChange(a)}
            >
              {a === 8 ? '8+' : `${a} yrs`}
            </button>
          ))}
        </div>
      </div>

      <div className="age-sec">
        <span className="age-label">📖 Reading readiness</span>
        <div className="stage-grid">
          {READING_STAGES.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`stage-card${readingStage === s.id ? ' on' : ''}`}
              onClick={() => onReadingChange(s.id)}
            >
              <b>{s.label}</b>
              <small>{s.desc}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="age-sec">
        <span className="age-label">🔢 Math readiness</span>
        <div className="stage-grid">
          {MATH_STAGES.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`stage-card${mathStage === s.id ? ' on' : ''}`}
              onClick={() => onMathChange(s.id)}
            >
              <b>{s.label}</b>
              <small>{s.desc}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AgeOnboardingModal({
  profile,
  onClose,
}: {
  profile: Profile;
  onClose: () => void;
}) {
  const initAge = profile.age ?? 5;
  const defaults = defaultStagesForAge(initAge);
  const [age, setAge] = useState<number>(initAge);
  const [readingStage, setReadingStage] = useState<ReadingStage>(profile.readingStage ?? defaults.readingStage);
  const [mathStage, setMathStage] = useState<MathStage>(profile.mathStage ?? defaults.mathStage);
  const [timerMode, setTimerMode] = useState<TimerMode>(profile.settings.timerMode ?? 'off');

  const handleAge = (nextAge: number) => {
    setAge(nextAge);
    const nextDefaults = defaultStagesForAge(nextAge);
    setReadingStage(nextDefaults.readingStage);
    setMathStage(nextDefaults.mathStage);
  };

  const save = () => {
    applyAgeCalibration(profile.id, {
      age,
      readingStage,
      mathStage,
      markPlacementDone: true,
    });
    patchProfile(profile.id, (p) => { p.settings.timerMode = timerMode; });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card age-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🎯 Age & Learning Level for {profile.name}</h2>
        <p className="small">
          Adjusts starting questions, puzzle difficulty, and turns off basic phonics or counting games when your child is ready for more!
        </p>
        <AgeStageFields
          age={age}
          readingStage={readingStage}
          mathStage={mathStage}
          onAgeChange={handleAge}
          onReadingChange={setReadingStage}
          onMathChange={setMathStage}
        />
        <div className="age-sec">
          <span className="age-label">⏱️ Question Timer & Speed Bonus Stars</span>
          <div className="stage-grid">
            {TIMER_MODES.map((tm) => (
              <button
                type="button"
                key={tm.id}
                className={`stage-card${timerMode === tm.id ? ' on' : ''}`}
                onClick={() => setTimerMode(tm.id)}
              >
                <b>{tm.label}</b>
                <small>{tm.desc}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <button type="button" className="btn primary" data-autofocus onClick={save}>
            Save & Update Games
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
