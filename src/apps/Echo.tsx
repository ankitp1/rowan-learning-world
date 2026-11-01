import { useEffect, useRef, useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Theme } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell, useStoredLevel } from '../ui/GameShell';
import { Bubble } from '../ui/QuestionCard';
import { GEMS } from './codeBreaker';

const NOTES = [262, 330, 392, 523, 440, 587];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Game({ level, theme, onWin, onNext, onExit }: { level: number; theme: Theme; onWin: (stars: number) => void; onNext: () => void; onExit: () => void }) {
  const pads = level < 2 ? 4 : level < 4 ? 5 : 6;
  const target = Math.min(4 + level, 12);
  const step = Math.max(380, 700 - level * 40);
  const [seq, setSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<'watch' | 'play' | 'won'>('watch');
  const [lit, setLit] = useState<number | null>(null);
  const [bubble, setBubble] = useState('Watch the pattern, then copy it!');
  const [mistakes, setMistakes] = useState(0);
  const [replays, setReplays] = useState(0);
  const alive = useRef(true);
  const pos = useRef(0);
  const cur = useRef<number[]>([]);

  const show = async (s: number[]) => {
    setPhase('watch'); pos.current = 0;
    await sleep(500);
    for (const p of s) {
      if (!alive.current) return;
      setLit(p); sfx.note(NOTES[p]);
      await sleep(step);
      setLit(null);
      await sleep(step * 0.4);
    }
    if (!alive.current) return;
    setPhase('play');
    setBubble('Your turn!');
  };

  useEffect(() => {
    alive.current = true;
    const first = [Math.floor(Math.random() * pads)];
    cur.current = first; setSeq(first);
    void show(first);
    return () => { alive.current = false; stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const press = async (p: number) => {
    if (phase !== 'play') return;
    setLit(p); sfx.note(NOTES[p]);
    setTimeout(() => setLit(null), 220);
    const s = cur.current;
    if (p === s[pos.current]) {
      pos.current += 1;
      if (pos.current === s.length) {
        if (s.length >= target) {
          setPhase('won'); sfx.chest();
          onWin(mistakes === 0 ? 3 : 2);
          void speak(theme.praise[Math.floor(Math.random() * theme.praise.length)]);
          return;
        }
        setPhase('watch');
        setBubble(`Great! ${s.length} in a row. One more!`);
        const next = [...s, Math.floor(Math.random() * pads)];
        cur.current = next; setSeq(next);
        await sleep(700);
        void show(next);
      }
    } else {
      setMistakes((m) => m + 1);
      sfx.soft();
      setPhase('watch');
      setBubble('Oops! Watch it again.');
      await sleep(700);
      void show(s);
    }
  };

  return (
    <GameShell title="Echo Sequence" icon="🎵" onExit={onExit} right={`${seq.length} of ${target}`} className="echo">
      <Bubble theme={theme} text={bubble} />
      <div className={`echo-pads p${pads}`}>
        {Array.from({ length: pads }, (_, i) => (
          <button key={i} className={`echo-pad${lit === i ? ' lit' : ''}`} style={{ ['--pad' as string]: GEMS[i].color }} onClick={() => void press(i)} disabled={phase !== 'play'} aria-label={`pad ${GEMS[i].name}`}>
            <span>{GEMS[i].glyph}</span>
          </button>
        ))}
      </div>
      <button className="btn" disabled={phase !== 'play'} onClick={() => { setReplays(replays + 1); void show(cur.current); }}>🔁 Watch again</button>
      {phase === 'won' && (
        <div className="overlay">
          <Confetti />
          <div className="card">
            <div className="big-emoji">🎵🎉</div>
            <h1>{target} in a row!</h1>
            <p>{mistakes === 0 ? 'Not one slip!' : `${mistakes} slip${mistakes === 1 ? '' : 's'} on the way.`}{replays ? ` You used ${replays} replay${replays === 1 ? '' : 's'}.` : ''}</p>
            <div className="row">
              <button className="btn primary" data-autofocus onClick={onNext}>Longer pattern</button>
              <button className="btn" onClick={onExit}>Done</button>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}

/** Echo Sequence: copy a growing pattern of lights and notes. No failing: a slip just replays the pattern. */
export default function Echo({ profile, theme, onExit }: MiniAppProps) {
  const [level, setLevel] = useStoredLevel(`rlw.echo.${profile.id}`);
  return <Game key={level} level={level} theme={theme} onWin={(s) => awardStars(profile.id, s)} onNext={() => setLevel(level + 1)} onExit={onExit} />;
}
