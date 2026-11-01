import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setGameLevel } from '../core/db';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Confetti } from '../ui/Art';
import { useStoredLevel } from '../ui/GameShell';
import { Bubble } from '../ui/QuestionCard';
import { generateMaze, mazeSpec, slide, type Dir } from './mazeGen';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Number Maze: big generated mazes (12x12 growing to 30x30). Collect 1, 2, 3... in order, then reach the exit.
 * One press runs along the corridor until a junction, so large mazes stay fun. Arrows/WASD, on-screen pad, or swipe.
 */
export default function Maze({ profile, theme, onExit, onComplete }: MiniAppProps) {
  const storeKey = `rlw.maze.${profile.id}`;
  const [level, setLevel] = useStoredLevel(storeKey);
  const [shuffle, setShuffle] = useState(0);
  const { size, numbers: k } = mazeSpec(level);
  const maze = useMemo(() => generateMaze(size, size, k), [size, k, level, shuffle]);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([{ x: 0, y: 0 }]);
  const [next, setNext] = useState(1);
  const [won, setWon] = useState(false);
  const [bubble, setBubble] = useState('');
  const busy = useRef(false);
  const alive = useRef(true);
  const live = useRef({ pos, next, won, maze });
  live.current = { pos, next, won, maze };
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    busy.current = false;
    setPos({ x: 0, y: 0 }); setTrail([{ x: 0, y: 0 }]); setNext(1); setWon(false);
    setBubble(`Find the numbers in order, starting with 1. Then reach the ${theme.container.name}!`);
  }, [maze, theme.container.name]);

  const say = useCallback((t: string) => { setBubble(t); void speak(t); }, []);

  const arrive = useCallback((cell: { x: number; y: number }, want: number) => {
    const m = live.current.maze;
    const num = m.numbers.find((n) => n.x === cell.x && n.y === cell.y);
    if (num && num.n === want) {
      sfx.star();
      setNext(want + 1);
      say(want === m.numbers.length ? `${num.n}! That's all of them. Now find the ${theme.container.name}!` : `${num.n}! Now find ${num.n + 1}.`);
      return;
    }
    if (num && num.n > want) { say(`That's ${num.n}. Find ${want} first!`); return; }
    if (cell.x === m.w - 1 && cell.y === m.h - 1) {
      if (want > m.numbers.length) {
        setWon(true);
        sfx.chest();
        awardStars(profile.id, 2);
        const lvl = level + 1;
        setGameLevel(storeKey, lvl);
        say(theme.praise[Math.floor(Math.random() * theme.praise.length)]);
      } else say(`Collect all the numbers first. Next is ${want}.`);
    }
  }, [level, profile.id, say, storeKey, theme.container.name, theme.praise]);

  const move = useCallback(async (d: Dir) => {
    const s = live.current;
    if (busy.current || s.won) return;
    const path = slide(s.maze, s.pos.x, s.pos.y, d);
    if (!path.length) { sfx.soft(); return; }
    busy.current = true;
    for (const cell of path) {
      if (!alive.current) return;
      setPos(cell);
      setTrail((t) => [...t, cell]);
      await sleep(45);
    }
    busy.current = false;
    arrive(path[path.length - 1], live.current.next);
  }, [arrive]);

  useEffect(() => {
    document.body.dataset.navLock = '1';
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: 'N', ArrowRight: 'E', ArrowDown: 'S', ArrowLeft: 'W', w: 'N', d: 'E', s: 'S', a: 'W' };
      const d = map[e.key];
      if (d) { e.preventDefault(); void move(d); }
    };
    window.addEventListener('keydown', onKey);
    return () => { delete document.body.dataset.navLock; window.removeEventListener('keydown', onKey); stopSpeaking(); };
  }, [move]);

  const onPointerDown = (e: React.PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    void move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N'));
  };

  const walls = useMemo(() => {
    let d = '';
    for (let y = 0; y < maze.h; y++) {
      for (let x = 0; x < maze.w; x++) {
        const c = maze.cells[y][x];
        if (c.N) d += `M${x} ${y}h1`;
        if (c.W) d += `M${x} ${y}v1`;
        if (x === maze.w - 1 && c.E) d += `M${x + 1} ${y}v1`;
        if (y === maze.h - 1 && c.S) d += `M${x} ${y + 1}h1`;
      }
    }
    return d;
  }, [maze]);

  const got = (n: number) => n < next;
  const unlocked = next > maze.numbers.length;
  return (
    <div className="screen maze">
      <header className="topbar">
        <button className="back" onClick={onExit} aria-label="Back">⬅</button>
        <h2>🌀 Number Maze</h2>
        <div className="clues">Maze {level + 1} · {size}×{size}</div>
      </header>
      <Bubble theme={theme} text={bubble} />
      <div className="maze-wrap">
        <svg
          className="maze-svg" viewBox={`-0.25 -0.25 ${size + 0.5} ${size + 0.5}`}
          onPointerDown={onPointerDown} onPointerUp={onPointerUp} role="application" aria-label="maze, use the arrow keys"
        >
          <rect x="-0.2" y="-0.2" width={size + 0.4} height={size + 0.4} rx="0.5" className="maze-frame" />
          <rect x="0" y="0" width={size} height={size} className="maze-floor" />
          <polyline className="maze-trail" points={trail.map((c) => `${c.x + 0.5},${c.y + 0.5}`).join(' ')} />
          <circle cx="0.5" cy="0.5" r="0.3" className="maze-start" />
          {unlocked && <circle cx={size - 0.5} cy={size - 0.5} r="0.55" className="maze-exit-glow" />}
          <text x={size - 0.5} y={size - 0.46} className="maze-exit" style={{ opacity: unlocked ? 1 : 0.55 }}>{theme.container.emoji}</text>
          <path d={walls} className="maze-walls" />
          {maze.numbers.filter((n) => !got(n.n)).map((n) => (
            <g key={n.n} className={n.n === next ? 'maze-num next' : 'maze-num'}>
              <circle cx={n.x + 0.5} cy={n.y + 0.5} r="0.36" />
              <text x={n.x + 0.5} y={n.y + 0.53}>{n.n}</text>
            </g>
          ))}
          <g className="maze-player" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
            <text x="0.5" y="0.54">{profile.avatar}</text>
          </g>
        </svg>
        <div className="dpad" aria-label="move buttons">
          <button onClick={() => void move('N')} aria-label="up" className="up">▲</button>
          <button onClick={() => void move('W')} aria-label="left" className="left">◀</button>
          <button onClick={() => void move('E')} aria-label="right" className="right">▶</button>
          <button onClick={() => void move('S')} aria-label="down" className="down">▼</button>
        </div>
      </div>
      <div className="maze-status">
        {maze.numbers.map((n) => <span key={n.n} className={`chip${got(n.n) ? ' got' : ''}${n.n === next ? ' next' : ''}`}>{n.n}</span>)}
        <button className="chip-btn" onClick={() => setShuffle((s) => s + 1)}>🔀 New maze</button>
      </div>
      {won && (
        <div className="overlay">
          <Confetti />
          <div className="card">
            <div className="big-emoji">{theme.container.emoji}🎉</div>
            <h1>You escaped!</h1>
            <p>Next maze is bigger: {mazeSpec(level + 1).size}×{mazeSpec(level + 1).size}.</p>
            <div className="row">
              <button className="btn primary" data-autofocus onClick={() => setLevel(level + 1)}>Next maze</button>
              <button className="btn" onClick={() => (onComplete ? onComplete({ correct: 1, total: 1 }) : onExit())}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
