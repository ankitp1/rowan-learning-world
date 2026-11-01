import { useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Theme } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell, useStoredLevel } from '../ui/GameShell';
import { Bubble, HelperButton } from '../ui/QuestionCard';
import { canMove, disksFor, isWon, move, optimalMoves, solve, startState, topDisk } from './hanoi';

function Game({ n, level, theme, onWin, onNext, onExit }: {
  n: number; level: number; theme: Theme; onWin: (stars: number) => void; onNext: () => void; onExit: () => void;
}) {
  const [s, setS] = useState(startState(n));
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [help, setHelp] = useState(0);
  const [hint, setHint] = useState<{ from: number; to: number } | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const [bubble, setBubble] = useState(`Move the whole tower to the flag peg. Only one disk at a time, and never a big disk on a small one.`);
  const won = isWon(s);
  const best = optimalMoves(n);

  const tap = (peg: number) => {
    if (won) return;
    if (sel === null) {
      if (topDisk(s, peg) < 0) { setShake(peg); setTimeout(() => setShake(null), 400); return; }
      sfx.tap(); setSel(peg); setHint(null); return;
    }
    if (sel === peg) { setSel(null); return; }
    if (!canMove(s, sel, peg)) {
      sfx.soft(); setShake(peg); setTimeout(() => setShake(null), 400);
      const m = "A big disk can't sit on a small one. Try another peg.";
      setBubble(m); void speak(m); return;
    }
    const next = move(s, sel, peg);
    setS(next); setSel(null); setMoves(moves + 1); setHint(null);
    sfx.tap();
    if (isWon(next)) {
      sfx.chest();
      const stars = moves + 1 === best ? 4 : 2;
      onWin(stars);
      const m = moves + 1 === best ? 'Perfect! The fewest possible moves!' : theme.praise[0];
      setBubble(m); void speak(m);
    }
  };

  const ask = () => {
    if (help >= 3 || won) return;
    const l = help + 1;
    setHelp(l);
    const step = solve(s)[0];
    if (l === 1) setBubble('Think about the biggest disk. It needs to reach the flag peg. What has to move out of its way first?');
    else if (l === 2) { setHint({ from: step.from, to: -1 }); setBubble('Look at the glowing peg. Move its top disk.'); }
    else { setHint(step); setBubble(`Move the top disk from peg ${step.from + 1} to peg ${step.to + 1}.`); }
    void speak('Here is a hint.');
  };

  return (
    <GameShell title="Tower Puzzle" icon="🗼" onExit={onExit} right={`${n} disks · ${moves} moves · best ${best}`} className="hanoi">
      <Bubble theme={theme} text={bubble} />
      <div className="pegs">
        {[0, 1, 2].map((p) => {
          const disks = s.map((peg, d) => (peg === p ? d : -1)).filter((d) => d >= 0); // small -> large, top to bottom
          return (
            <button
              key={p}
              className={`hpeg${sel === p ? ' sel' : ''}${hint && (hint.from === p || hint.to === p) ? ' hint' : ''}${shake === p ? ' shake' : ''}`}
              onClick={() => tap(p)} aria-label={`peg ${p + 1}${p === 2 ? ', goal' : ''}`}
            >
              <span className="flag">{p === 2 ? '🏁' : p + 1}</span>
              <span className="pole" />
              <span className="stack">
                {disks.map((d, i) => (
                  <span key={d} className={`disk${sel === p && i === 0 ? ' lifted' : ''}`}
                    style={{ width: `${32 + (n === 1 ? 0 : (d / (n - 1)) * 62)}%`, background: `hsl(${d * 48 + 8} 82% 58%)` }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <div className="row">
        <HelperButton theme={theme} level={help} max={3} onAsk={ask} />
        <button className="btn" onClick={() => { setS(startState(n)); setSel(null); setMoves(0); setHint(null); }}>↺ Start over</button>
      </div>
      {won && (
        <div className="overlay">
          <Confetti />
          <div className="card">
            <div className="big-emoji">🗼🎉</div>
            <h1>Tower moved!</h1>
            <p>{moves === best ? 'In the fewest possible moves!' : `${moves} moves. The fewest possible is ${best}.`}</p>
            <div className="row">
              <button className="btn primary" data-autofocus onClick={onNext}>{level < 4 ? 'Add a disk' : 'Play again'}</button>
              <button className="btn" onClick={onExit}>Done</button>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}

/** Tower puzzle (Tower of Hanoi): 3 disks growing to 7. The helper's hints come from a real shortest-path solver. */
export default function Hanoi({ profile, theme, onExit }: MiniAppProps) {
  const [level, setLevel] = useStoredLevel(`rlw.hanoi.${profile.id}`);
  const [round, setRound] = useState(0);
  const n = disksFor(level);
  return (
    <Game
      key={`${level}-${round}`} n={n} level={level} theme={theme}
      onWin={(stars) => awardStars(profile.id, stars)}
      onNext={() => { stopSpeaking(); if (level < 4) setLevel(level + 1); else setRound(round + 1); }}
      onExit={onExit}
    />
  );
}
