import { useEffect, useMemo, useRef, useState } from 'react';
import { getGameLevel, setGameLevel } from '../core/db';
import { awardStars } from '../core/engine';
import { sfx, speak, speakSound, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Theme } from '../core/types';
import { Collectible, Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';
import { gridFor, isMatch, makeDeck, type Card, type Mode } from './memory';

const MODES: { mode: Mode; icon: string; title: string; blurb: string }[] = [
  { mode: 'pictures', icon: '🐱', title: 'Picture pairs', blurb: 'Everyday favorites & cute objects' },
  { mode: 'dinos', icon: '🦖', title: 'Dino World', blurb: 'T-Rex, fossils & raptor tracks' },
  { mode: 'animals', icon: '🦁', title: 'Safari Animals', blurb: 'Lions, monkeys & elephants' },
  { mode: 'space', icon: '🚀', title: 'Space Adventure', blurb: 'Rockets, planets & aliens' },
  { mode: 'ocean', icon: '🌊', title: 'Under the Sea', blurb: 'Dolphins, sharks & sea turtles' },
  { mode: 'vehicles', icon: '🏎️', title: 'Fast Vehicles', blurb: 'Fire engines, trains & rockets' },
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
  const [streak, setStreak] = useState(0);
  const [peeking, setPeeking] = useState(false);
  const [peeksLeft, setPeeksLeft] = useState(1);
  const busy = useRef(false);
  const alive = useRef(true);
  const won = matched.length === deck.length;
  useEffect(() => { alive.current = true; return () => { alive.current = false; stopSpeaking(); }; }, []);

  const flip = (c: Card) => {
    if (busy.current || won || peeking || up.includes(c.id) || matched.includes(c.id)) return;
    sfx.tap();
    if (c.kind === 'emoji' && c.word) void speak(c.word, { rate: 1.05 });
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
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        if (nextStreak === 2) void speak('Double match! Great memory!', { pitch: 1.05 });
        else if (nextStreak >= 3) void speak(`Combo streak of ${nextStreak}! Unstoppable!`, { pitch: 1.08 });
        else if (a.word) void speak(`Match! ${a.word}!`);

        const m = [...matched, a.id, b.id];
        setMatched(m); setUp([]); busy.current = false;
        if (m.length === deck.length) {
          sfx.chest();
          onWin(moves + 1 <= Math.ceil(pairs * 1.7) ? 3 : 1);
        }
      }, 550);
    } else {
      setStreak(0);
      setTimeout(() => { if (alive.current) { setUp([]); busy.current = false; } }, 950);
    }
  };

  const handleMagicPeek = () => {
    if (peeksLeft <= 0 || busy.current || won || peeking) return;
    sfx.chest();
    setPeeksLeft((p) => p - 1);
    setPeeking(true);
    void speak('Magic Peek! Quick, spot the pairs!');
    setTimeout(() => {
      if (alive.current) setPeeking(false);
    }, 1300);
  };

  const currentModeInfo = MODES.find((m) => m.mode === mode);

  return (
    <GameShell
      title={`${currentModeInfo?.icon ?? '🃏'} ${currentModeInfo?.title ?? 'Memory Match'}`}
      icon="🃏"
      onExit={onExit}
      right={`${rows}×${cols} · ${moves} tries${streak >= 2 ? ` · 🔥 ×${streak}` : ''}`}
      className="memory"
    >
      <div className="memory-controls-bar row align-center justify-between" style={{ width: '100%', maxWidth: '800px', margin: '0 auto 8px', padding: '0 8px' }}>
        <div className="row align-center gap-8">
          <span className="chip" style={{ width: 'auto', padding: '4px 12px', height: '36px', borderRadius: '16px', fontSize: '16px' }}>
            Matched: {matched.length / 2} / {pairs}
          </span>
          {streak >= 2 && (
            <span className="chip" style={{ width: 'auto', padding: '4px 12px', height: '36px', borderRadius: '16px', fontSize: '16px', background: '#FFD36A', color: '#1a1a1a' }}>
              🔥 Combo ×{streak}!
            </span>
          )}
        </div>
        {peeksLeft > 0 && !won && (
          <button
            className="btn"
            style={{ fontSize: '16px', padding: '6px 14px' }}
            onClick={handleMagicPeek}
            disabled={peeking || busy.current}
            title="Flash all cards for a brief peek!"
            aria-label="Magic peek power"
          >
            👁️ Magic Peek ({peeksLeft})
          </button>
        )}
      </div>

      <div className="mgrid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, ['--cols' as string]: cols }}>
        {deck.map((c) => {
          const open = peeking || up.includes(c.id) || matched.includes(c.id);
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
          <div className="card text-center">
            <div className="big-emoji">{currentModeInfo?.icon ?? '🃏'}🎉</div>
            <h1>All matched!</h1>
            <p>Fantastic job! You found all {pairs} pairs in {moves} tries!</p>
            <div className="row justify-center mt-12 gap-8">
              <button className="btn primary big" data-autofocus onClick={onNext}>{level < 5 ? 'Bigger Board ➡️' : 'Play Again 🔁'}</button>
              <button className="btn" onClick={onChange}>Change Theme</button>
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

/** Memory Match: pictures, dinos, animals, space, ocean, vehicles, letters, numbers. */
export default function MemoryMatch({ profile, theme, onExit }: MiniAppProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(0);
  const choose = (m: Mode) => { setLevel(readLevel(profile.id, m)); setMode(m); setRound(0); };
  const save = (m: Mode, l: number) => setGameLevel(levelKey(profile.id, m), l);

  if (!mode) {
    return (
      <GameShell title="Memory Match" icon="🃏" onExit={onExit}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>Choose a Theme to Match!</h1>
        <p style={{ textAlign: 'center', opacity: 0.85, marginBottom: '16px' }}>Pick a favorite topic and find all the matching pairs!</p>
        <div className="app-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
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
