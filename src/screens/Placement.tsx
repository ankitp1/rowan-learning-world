import { useRef, useState } from 'react';
import { avoidKey, makeQuestion } from '../content/generators';
import { Placement, applyPlacement } from '../core/engine';
import { patchProfile } from '../core/db';
import { speak } from '../core/speech';
import type { Profile, Question, Subject, Theme } from '../core/types';
import QuestionCard, { type AnswerResult } from '../ui/QuestionCard';

const LABEL: Record<string, string> = { reading: 'Reading', math: 'Math' };

/**
 * The placement "Treasure Hunt": a binary search up each skill ladder.
 * No hints and no "wrong" feedback, just encouragement. Sets the starting level per subject.
 */
export default function PlacementScreen({ profile, theme, subjects = ['reading', 'math'], onDone, onExit }: {
  profile: Profile; theme: Theme; subjects?: Subject[]; onDone: () => void; onExit: () => void;
}) {
  const [si, setSi] = useState(-1); // -1 intro, subjects.length = summary
  const runner = useRef<Placement | null>(null);
  const avoid = useRef<string[]>([]);
  const [q, setQ] = useState<Question | null>(null);
  const [count, setCount] = useState(0);
  const [found, setFound] = useState<Record<string, string>>({});

  const startSubject = (i: number) => {
    runner.current = new Placement(subjects[i]);
    avoid.current = [];
    setCount(0);
    setSi(i);
    setQ(makeQuestion(runner.current.skill.id, { difficulty: 1 }));
    void speak(i === 0 ? `Let's find the treasure!` : 'Now the next treasure map!');
  };

  const onResult = (r: AnswerResult) => {
    const run = runner.current!;
    run.submit(r.correct);
    avoid.current = [...avoid.current.slice(-8), avoidKey(q!)];
    setCount((c) => c + 1);
    if (run.done) {
      const subject = subjects[si];
      applyPlacement(profile.id, subject, run.level);
      setFound((f) => ({ ...f, [subject]: run.rungs[run.level].name }));
      if (si + 1 < subjects.length) { startSubject(si + 1); return; }
      patchProfile(profile.id, (p) => { p.placementDone = true; });
      setQ(null);
      setSi(subjects.length);
      void speak('You found the treasure! Great exploring!');
      return;
    }
    setQ(makeQuestion(run.skill.id, { difficulty: 1, avoid: avoid.current }));
  };

  if (si === -1) {
    return (
      <div className="screen placement">
        <div className="big-emoji">🗺️</div>
        <h1>The Treasure Hunt!</h1>
        <p>{theme.helper.name} found a treasure map. Answer a few questions to follow it. There are no wrong answers, just keep trying!</p>
        <div className="row">
          <button className="btn primary big" data-autofocus onClick={() => startSubject(0)}>Start!</button>
          <button className="btn" onClick={onExit}>Later</button>
        </div>
      </div>
    );
  }

  if (si >= subjects.length) {
    return (
      <div className="screen placement">
        <div className="big-emoji">{theme.container.emoji}🎉</div>
        <h1>Treasure found!</h1>
        {subjects.map((s) => <p key={s}><b>{LABEL[s] ?? s}:</b> starting at {found[s]}</p>)}
        <p className="small">A grown-up can change these any time in Grown-ups mode.</p>
        <button className="btn primary big" data-autofocus onClick={onDone}>Let's play!</button>
      </div>
    );
  }

  return (
    <div className="screen placement">
      <header className="topbar">
        <button className="back" onClick={onExit} aria-label="Back">⬅</button>
        <h2>🗺️ {LABEL[subjects[si]] ?? subjects[si]} hunt</h2>
        <div className="pips">{Array.from({ length: Math.min(count, 12) }, (_, i) => <i key={i} className="used" />)}</div>
      </header>
      {q && (
        <div key={q.id} className="round-body">
          <QuestionCard q={q} theme={theme} profile={profile} mode="placement" onResult={onResult} />
        </div>
      )}
    </div>
  );
}
