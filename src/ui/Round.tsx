import { useEffect, useRef, useState, type ReactNode } from 'react';
import { avoidKey, makeQuestion } from '../content/generators';
import { Tracker, awardStars, baseDifficulty, logAttempt, pickSkill, statesOf } from '../core/engine';
import { appById } from '../core/registry';
import { sfx, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Question } from '../core/types';
import { Confetti } from './Art';
import QuestionCard, { type AnswerResult } from './QuestionCard';

export interface RoundApi {
  q: Question;
  index: number;
  total: number;
  proactive: boolean;
  /** Log the attempt, update the skill map and move to the next question. */
  answer: (r: AnswerResult) => void;
}

function RoundInner({ appId, props, children }: { appId: string; props: MiniAppProps; children: (r: RoundApi) => ReactNode }) {
  const { profile, theme, onExit, onComplete } = props;
  const app = appById(appId)!;
  const total = props.rounds ?? 5;
  const tracker = useRef(new Tracker());
  const avoid = useRef<string[]>([]);
  const gen = (): Question => {
    const states = statesOf(profile.id);
    const p = pickSkill(profile, app.subject, app.skills, { frustrated: tracker.current.frustrated, states });
    const d = tracker.current.difficulty(baseDifficulty(p.skillId, states));
    return makeQuestion(p.skillId, { difficulty: d, avoid: avoid.current });
  };
  const [q, setQ] = useState<Question>(gen);
  const [proactive, setProactive] = useState(false);
  const [index, setIndex] = useState(0);
  const [right, setRight] = useState(0);
  const [starsWon, setStarsWon] = useState(0);
  const [done, setDone] = useState(false);
  const reported = useRef(false);

  const answer = (r: AnswerResult) => {
    logAttempt(profile.id, {
      skillIds: [q.skill], appId, correct: r.correct, given: r.given, expected: r.expected,
      hintsUsed: r.hintsUsed, ms: r.ms, errorTags: r.tags,
    });
    tracker.current.record(r.correct, r.ms);
    avoid.current = [...avoid.current.slice(-6), avoidKey(q)];
    if (r.correct) {
      const earned = r.starsEarned ?? 1;
      setRight((n) => n + 1);
      setStarsWon((s) => s + earned);
      awardStars(profile.id, earned);
    }
    if (index + 1 >= total) { setDone(true); return; }
    setProactive(tracker.current.proactiveHint);
    setIndex(index + 1);
    setQ(gen());
  };

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      sfx.star();
      if (onComplete) { const id = setTimeout(() => onComplete({ correct: right, total }), 900); return () => clearTimeout(id); }
    }
  }, [done, onComplete, right, total]);

  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="screen round">
      <header className="topbar">
        <button className="back" onClick={onExit} aria-label="Back">⬅</button>
        <h2>{app.icon} {app.title}</h2>
        <div className="pips">{Array.from({ length: total }, (_, i) => <i key={i} className={i < index + (done ? 1 : 0) ? 'used' : i === index ? 'now' : ''} />)}</div>
      </header>
      {!done ? (
        <div key={q.id} className="round-body">{children({ q, index, total, proactive, answer })}</div>
      ) : (
        <div className="round-done">
          <Confetti />
          <div className="big-emoji pop">🎉</div>
          <h1>{right} of {total}!</h1>
          <div className="stars">{Array.from({ length: Math.min(starsWon || right, 15) }, (_, i) => <span key={i}>⭐</span>)}</div>
          {starsWon > right && <p className="speed-summary">⚡ +{starsWon - right} Speed Bonus Stars!</p>}
          {!onComplete && (
            <div className="row">
              <button className="btn primary" data-autofocus onClick={() => window.dispatchEvent(new CustomEvent('round:again'))}>Play again</button>
              <button className="btn" onClick={onExit}>All done</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Round shell: question loop, progress, adaptive picking, end screen. `children` draws one question. */
export default function Round(p: { appId: string; props: MiniAppProps; children: (r: RoundApi) => ReactNode }) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    const again = () => setRun((n) => n + 1);
    window.addEventListener('round:again', again);
    return () => window.removeEventListener('round:again', again);
  }, []);
  return <RoundInner key={run} {...p} />;
}

/** Standard multiple-choice app body (picture/word/number choices). */
export function McApp({ appId, props, variant }: { appId: string; props: MiniAppProps; variant?: 'plank' | 'bridge' | 'ropes' | 'groups' }) {
  return (
    <Round appId={appId} props={props}>
      {(r) => (
        <QuestionCard
          q={r.q} theme={props.theme} profile={props.profile} proactive={r.proactive} variant={variant}
          onResult={r.answer}
        />
      )}
    </Round>
  );
}
