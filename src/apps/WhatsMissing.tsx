import { useEffect, useMemo, useRef, useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Theme } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell, useStoredLevel } from '../ui/GameShell';
import { Bubble } from '../ui/QuestionCard';
import { makeRound, roundSpec } from './missing';

const ROUNDS = 5;
const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

function Game({ level, theme, onWin, onNext, onExit }: { level: number; theme: Theme; onWin: (stars: number) => void; onNext: (up: boolean) => void; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [clean, setClean] = useState(0);
  const round = useMemo(() => makeRound(level), [level, idx]);
  const [phase, setPhase] = useState<'study' | 'cover' | 'pick' | 'done'>('study');
  const [found, setFound] = useState<string[]>([]);
  const [slip, setSlip] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const [bubble, setBubble] = useState('');
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const spec = roundSpec(level);
  const goneItems = round.missing.map((m) => round.items[m]);
  // slots shown while picking: missing items become "?" and, at higher levels, everything is reshuffled
  const slots = useMemo(() => {
    const s: (string | null)[] = round.items.map((it, i) => (round.missing.includes(i) ? null : it));
    return round.shuffleAfter ? shuffle(s) : s;
  }, [round]);

  useEffect(() => { alive.current = true; return () => { alive.current = false; clearTimeout(timer.current); stopSpeaking(); }; }, []);

  useEffect(() => {
    setPhase('study'); setFound([]); setSlip(false);
    setBubble('Look carefully! Remember everything.');
    void speak('Look carefully!');
    timer.current = setTimeout(() => endStudy(), round.study * 1000);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const endStudy = () => {
    clearTimeout(timer.current);
    if (!alive.current) return;
    setPhase('cover'); setBubble('Close your eyes...');
    timer.current = setTimeout(() => {
      if (!alive.current) return;
      setPhase('pick');
      const m = round.missing.length > 1 ? `${round.missing.length} things disappeared. What are they?` : 'Something disappeared. What is it?';
      setBubble(m); void speak(m);
    }, 1100);
  };

  const choose = (opt: string) => {
    if (phase !== 'pick' || found.includes(opt)) return;
    if (goneItems.includes(opt)) {
      sfx.star();
      const f = [...found, opt];
      setFound(f);
      if (f.length === goneItems.length) {
        setPhase('done'); sfx.good();
        const ok = !slip;
        if (ok) setClean((c) => c + 1);
        setBubble(ok ? theme.praise[Math.floor(Math.random() * theme.praise.length)] : 'You found it! Good looking.');
        void speak(ok ? 'You remembered it!' : 'You found it!');
        timer.current = setTimeout(() => {
          if (!alive.current) return;
          if (idx + 1 >= ROUNDS) { setIdx(ROUNDS); } else setIdx(idx + 1);
        }, 1300);
      }
    } else {
      sfx.soft(); setSlip(true); setShake(opt); setTimeout(() => setShake(null), 450);
      setBubble('Not that one. Think about what you saw!');
    }
  };

  useEffect(() => { if (idx >= ROUNDS) onWin(clean); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (idx >= ROUNDS) {
    return (
      <GameShell title="What's Missing?" icon="🔎" onExit={onExit}>
        <Confetti />
        <div className="round-done">
          <div className="big-emoji pop">🔎🎉</div>
          <h1>{clean} of {ROUNDS} remembered!</h1>
          <p>{clean >= 4 ? 'Wow. Ready for a harder one?' : 'Great looking. Try the same level again to get even better.'}</p>
          <div className="row">
            <button className="btn primary" data-autofocus onClick={() => onNext(clean >= 4)}>{clean >= 4 ? 'Harder level' : 'Play again'}</button>
            <button className="btn" onClick={onExit}>Done</button>
          </div>
        </div>
      </GameShell>
    );
  }

  let fillIdx = 0;
  return (
    <GameShell title="What's Missing?" icon="🔎" onExit={onExit} right={`Round ${idx + 1} of ${ROUNDS} · level ${level + 1}`} className="missing">
      <Bubble theme={theme} text={bubble} />
      {phase === 'study' && (
        <div className="study-bar" aria-hidden><i style={{ animationDuration: `${round.study}s` }} /></div>
      )}
      <div className={`mgrid-items n${slots.length}`}>
        {(phase === 'study' ? round.items : slots).map((it, i) => {
          const hidden = phase === 'cover';
          if (it === null) {
            const got = found[fillIdx++];
            return <span key={i} className={`mitem blank${got ? ' got' : ''}`}>{got ?? '❓'}</span>;
          }
          return <span key={i} className={`mitem${hidden ? ' hide' : ''}`}>{hidden ? '' : it}</span>;
        })}
      </div>
      {phase === 'study' && <button className="btn primary" data-autofocus onClick={endStudy}>I remember! 👍</button>}
      {(phase === 'pick' || phase === 'done') && (
        <div className="choices">
          {round.options.map((o) => (
            <button key={o} className={`choice${found.includes(o) ? ' right' : ''}${shake === o ? ' shake-once' : ''}`} onClick={() => choose(o)} aria-label={`pick ${o}`}>
              <span className="ce">{o}</span>
            </button>
          ))}
        </div>
      )}
      <p className="small">{spec.missing > 1 ? 'Two things are missing.' : ''}</p>
    </GameShell>
  );
}

/** What's Missing?: study a set of pictures, then spot what vanished. Gets bigger, faster and sneakier. */
export default function WhatsMissing({ profile, theme, onExit }: MiniAppProps) {
  const [level, setLevel] = useStoredLevel(`rlw.missing.${profile.id}`);
  const [run, setRun] = useState(0);
  return (
    <Game
      key={`${level}-${run}`} level={level} theme={theme}
      onWin={(clean) => awardStars(profile.id, clean)}
      onNext={(up) => { if (up) setLevel(level + 1); else setRun(run + 1); }}
      onExit={onExit}
    />
  );
}
