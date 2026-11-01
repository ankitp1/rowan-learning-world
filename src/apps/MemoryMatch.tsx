import { useEffect, useMemo, useRef, useState } from 'react';
import { getGameLevel, setGameLevel } from '../core/db';
import { awardStars } from '../core/engine';
import { sfx, speak, speakSound, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Theme } from '../core/types';
import { Collectible, Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';
import { gridFor, isMatch, makeDeck, type Card, type Mode } from './memory';

const MODES: { mode: Mode; icon: string; title: string; blurb: string }[] = [
  { mode: 'pictures', icon: '🐱', title: 'Picture pairs', blurb: 'Find two that match' },
  { mode: 'letters', icon: '🔤', title: 'Letters and pictures', blurb: 'Match a letter to what starts with it' },
  { mode: 'numbers', icon: '🔢', title: 'Numbers and dots', blurb: 'Match 5 to five dots' },
];

function Face({ c, theme }: { c: Card; theme: Theme }) {
  if (c.kind === 'emoji') return <span className="mc-emoji">{c.value}</span>;
  if (c.kind === 'letter') return <span className="mc-letter">{String(c.value).toUpperCase()}{c.value}</span>;
  if (c.kind === 'number') return <span className="mc-num">{c.value}</span>;
  return <span className="mc-dots">{Array.from({ length: Number(c.value) }, (_, i) => <Collectible key={i} themeId={theme.id} />)}</span>;
}

function Game({ mode, level, theme, onWin, onNext, onChange, onExit }: {
  mode: Mode; level: number; theme: Theme; onWin: (stars: number) => void; onNext: () => void; onChange: () => void; onExit: () => void;
}) {
  const { rows, cols, pairs } = gridFor(level);
  const deck = useMemo(() => makeDeck(mode, pairs), [mode, pairs]);
  const [up, setUp] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const busy = useRef(false);
  const alive = useRef(true);
  const won = matched.length === deck.length;
  useEffect(() => { alive.current = true; return () => { alive.current = false; stopSpeaking(); }; }, []);

  const flip = (c: Card) => {
    if (busy.current || won || up.includes(c.id) || matched.includes(c.id)) return;
    sfx.tap();
    if (c.kind === 'emoji' && c.word) void speak(c.word);
    else if (c.kind === 'letter') void speakSound(String(c.value));
    else if (c.kind === 'number' || c.kind === 'dots') void speak(String(c.value));
    const now = [...up, c.id];
    setUp(now);
    if (now.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = now.map((id) => deck.find((x) => x.id === id)!);
    busy.current = true;
    if (isMatch(a, b)) {
      setTimeout(() => {
        if (!alive.current) return;
        sfx.star();
        const m = [...matched, a.id, b.id];
        setMatched(m); setUp([]); busy.current = false;
        if (m.length === deck.length) {
          sfx.chest();
          onWin(moves + 1 <= Math.ceil(pairs * 1.7) ? 3 : 1);
        }
      }, 600);
    } else {
      setTimeout(() => { if (alive.current) { setUp([]); busy.current = false; } }, 1000);
    }
  };

  return (
    <GameShell title="Memory Match" icon="🃏" onExit={onExit} right={`${rows}×${cols} · ${moves} tries`} className="memory">
      <div className="mgrid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, ['--cols' as string]: cols }}>
        {deck.map((c) => {
          const open = up.includes(c.id) || matched.includes(c.id);
          return (
            <button key={c.id} className={`mcard${open ? ' open' : ''}${matched.includes(c.id) ? ' done' : ''}`} onClick={() => flip(c)} aria-label={open ? `${c.kind} ${c.value}` : 'hidden card'}>
              <span className="mc-in">
                <span className="mc-back">{theme.container.emoji}</span>
                <span className="mc-front"><Face c={c} theme={theme} /></span>
              </span>
            </button>
          );
        })}
      </div>
      {won && (
        <div className="overlay">
          <Confetti />
          <div className="card">
            <div className="big-emoji">🃏🎉</div>
            <h1>All matched!</h1>
            <p>{moves} tries for {pairs} pairs.</p>
            <div className="row">
              <button className="btn primary" data-autofocus onClick={onNext}>{level < 5 ? 'Bigger board' : 'Play again'}</button>
              <button className="btn" onClick={onChange}>Change game</button>
              <button className="btn" onClick={onExit}>Done</button>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}

const levelKey = (pid: string, mode: Mode) => `rlw.mem.${pid}.${mode}`;
const readLevel = (pid: string, mode: Mode) => getGameLevel(levelKey(pid, mode));

/** Memory Match: pictures, letters-to-pictures, numbers-to-dots. Boards grow from 2x3 to 6x6. */
export default function MemoryMatch({ profile, theme, onExit }: MiniAppProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(0);
  const choose = (m: Mode) => { setLevel(readLevel(profile.id, m)); setMode(m); setRound(0); };
  const save = (m: Mode, l: number) => setGameLevel(levelKey(profile.id, m), l);

  if (!mode) {
    return (
      <GameShell title="Memory Match" icon="🃏" onExit={onExit}>
        <h1>What shall we match?</h1>
        <div className="app-cards">
          {MODES.map((m, i) => (
            <button key={m.mode} className="app-card" data-autofocus={i === 0 ? '' : undefined} onClick={() => choose(m.mode)}>
              <span className="a-icon">{m.icon}</span><b>{m.title}</b><small>{m.blurb}</small>
            </button>
          ))}
        </div>
      </GameShell>
    );
  }
  return (
    <Game
      key={`${mode}-${level}-${round}`} mode={mode} level={level} theme={theme}
      onWin={(stars) => awardStars(profile.id, stars)}
      onNext={() => { const l = Math.min(level + 1, 5); save(mode, l); if (l !== level) setLevel(l); else setRound(round + 1); }}
      onChange={() => setMode(null)} onExit={onExit}
    />
  );
}
