import { useEffect, useRef, type ReactNode } from 'react';
import { getGameLevel, setGameLevel, useDB } from '../core/db';

/** Standard frame for self-contained games: back button, title, optional right-hand badge. */
export function GameShell({ title, icon, onExit, right, children, className = '' }: {
  title: string; icon: string; onExit: () => void; right?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`screen ${className}`}>
      <header className="topbar">
        <button className="back" onClick={onExit} aria-label="Back">⬅</button>
        <h2>{icon} {title}</h2>
        {right && <div className="clues">{right}</div>}
      </header>
      {children}
    </div>
  );
}

/** A level that survives reloads and syncs across devices (per player, per game). */
export function useStoredLevel(key: string): [number, (n: number) => void] {
  useDB();
  const lvl = getGameLevel(key);
  return [lvl, (n: number) => setGameLevel(key, n)];
}

/** True while mounted. Re-arms on mount so React StrictMode's dev-only cleanup can't leave it false. */
export function useAlive() {
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  return alive;
}
