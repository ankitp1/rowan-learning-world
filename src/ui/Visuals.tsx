import type { Question, Theme } from '../core/types';
import { Collectible } from './Art';

/** Coins (or sparks) in rows of five. `lit` dims everything after the first N (used while counting aloud). */
export function CoinGrid({ n, themeId, lit, gone = 0, alt = false }: {
  n: number; themeId: string; lit?: number; gone?: number; alt?: boolean;
}) {
  return (
    <div className={`coins${alt ? ' alt' : ''}`} aria-label={`${n} items`}>
      {Array.from({ length: n }, (_, i) => {
        const isGone = i >= n - gone;
        const dim = lit !== undefined && i >= lit && !isGone;
        const on = lit !== undefined && i < lit && !isGone;
        return <span key={i} className={`coin${dim ? ' dim' : ''}${on ? ' lit' : ''}${isGone ? ' gone' : ''}`}><Collectible themeId={themeId} /></span>;
      })}
    </div>
  );
}

export function NumberLine({ from, dir, steps, hi }: { from: number; dir: 1 | -1; steps: number; hi: number | null }) {
  const max = Math.max(10, from, from + dir * steps);
  const lo = Math.min(from, from + dir * steps);
  return (
    <div className="numline" aria-hidden>
      {Array.from({ length: max + 1 }, (_, i) => {
        const k = dir === 1 ? i - from : from - i;
        const onPath = k > 0 && k <= steps;
        const lit = onPath && hi !== null && hi >= k;
        const cls = ['nl', i === from ? 'start' : '', onPath ? 'path' : '', lit ? 'lit' : '', i < lo - 0 && false ? 'x' : ''].join(' ');
        return <span key={i} className={cls}>{i}</span>;
      })}
    </div>
  );
}

function TenFrame({ filled, extra, themeId }: { filled: number; extra: number | null; themeId: string }) {
  return (
    <div className="tenframe">
      {Array.from({ length: 10 }, (_, i) => {
        const on = i < filled;
        const add = extra !== null && i >= filled && i < filled + extra;
        return <span key={i} className={`cell${on ? ' on' : ''}${add ? ' add' : ''}`}>{on || add ? <Collectible themeId={themeId} /> : null}</span>;
      })}
    </div>
  );
}

/** Sequence of numbers spoken (and coins lit) when the helper counts with the child. */
export function countSeq(q: Question): number[] {
  const upTo = (n: number, from = 1) => Array.from({ length: Math.max(0, n - from + 1) }, (_, i) => from + i);
  switch (q.kind) {
    case 'count': return upTo(q.n ?? 0);
    case 'compare': return [...upTo(q.a ?? 0), ...upTo(q.b ?? 0)];
    case 'add': return upTo((q.a ?? 0) + (q.b ?? 0));
    case 'sub': return upTo((q.a ?? 0) - (q.b ?? 0));
    case 'make10': return upTo(10, (q.a ?? 0) + 1);
    default: return [];
  }
}

export function MathVisual({ q, theme, hi }: { q: Question; theme: Theme; hi: number | null }) {
  const e = theme.id;
  const lit = (cap: number, offset = 0) => (hi === null ? undefined : Math.max(0, Math.min(cap, hi - offset)));
  const a = q.a ?? 0;
  const b = q.b ?? 0;
  switch (q.kind) {
    case 'count':
      return <CoinGrid n={q.n ?? 0} themeId={e} lit={lit(q.n ?? 0)} />;
    case 'compare':
      if (q.support === 2) return <div className="bignum">{a} <span>?</span> {b}</div>;
      return (
        <div className="piles">
          <CoinGrid n={a} themeId={e} lit={lit(a)} />
          <span className="vs">vs</span>
          <CoinGrid n={b} themeId={e} lit={lit(b, a)} alt />
        </div>
      );
    case 'add':
      if (q.support === 2) return <div className="bignum">{a} + {b}</div>;
      if (q.support === 1) return <NumberLine from={a} dir={1} steps={b} hi={hi === null ? null : Math.max(0, hi - a)} />;
      return (
        <div className="piles">
          <CoinGrid n={a} themeId={e} lit={lit(a)} />
          <span className="vs">+</span>
          <CoinGrid n={b} themeId={e} lit={lit(b, a)} alt />
        </div>
      );
    case 'sub':
      if (q.support === 2) return <div className="bignum">{a} − {b}</div>;
      if (q.support === 1) return <NumberLine from={a} dir={-1} steps={b} hi={hi} />;
      return (
        <div className="piles">
          <CoinGrid n={a} themeId={e} gone={b} lit={lit(a - b)} />
          <span className="thief">{theme.thief.emoji}<small>takes {b}</small></span>
        </div>
      );
    case 'make10':
      if (q.support === 2) return <div className="bignum">{a} + ? = 10</div>;
      return <TenFrame filled={a} extra={hi} themeId={e} />;
    default:
      return null;
  }
}

/** The word as big letter tiles. Digraphs stay together. */
export function WordTiles({ tiles, active, onTile, joined, spread }: {
  tiles: string[]; active?: number; onTile?: (i: number) => void; joined?: boolean; spread?: boolean;
}) {
  return (
    <div className={`wordtiles${joined ? ' joined' : ''}${spread ? ' spread' : ''}`}>
      {tiles.map((t, i) => {
        const cls = `tile${active === i ? ' active' : ''}`;
        return onTile
          ? <button key={i} className={cls} onClick={() => onTile(i)} aria-label={`letter ${t}`}>{t}</button>
          : <span key={i} className={cls}>{t}</span>;
      })}
    </div>
  );
}

/** Coloured shape for Captain's Log. */
export function ShapeSvg({ shape }: { shape: NonNullable<import('../core/types').Choice['shape']> }) {
  const sz = shape.big ? 96 : 52;
  const f = shape.color;
  const common = { fill: f, stroke: 'rgba(0,0,0,.35)', strokeWidth: 3, strokeLinejoin: 'round' as const };
  return (
    <svg width={sz} height={sz} viewBox="0 0 100 100" aria-hidden className="shape-svg">
      {shape.kind === 'circle' && <circle cx="50" cy="50" r="42" {...common} />}
      {shape.kind === 'square' && <rect x="10" y="10" width="80" height="80" rx="10" {...common} />}
      {shape.kind === 'triangle' && <path d="M50 8 L94 90 H6Z" {...common} />}
      {shape.kind === 'star' && <path d="M50 6 l13 28 30 4 -22 21 6 30 -27 -15 -27 15 6 -30 -22 -21 30 -4Z" {...common} />}
      <path d="M22 30 a32 32 0 0 1 22 -16" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".55" />
    </svg>
  );
}

/** Number Bonds Bridge: planks already placed, the gap, and what the chosen planks would do. */
export function BridgeVisual({ a, gap, pick }: { a: number; gap: number; pick: number | null }) {
  const over = pick !== null && pick > gap ? Math.min(pick - gap, 6) : 0;
  const msg = pick === null ? `${a} planks are in place. How many more make 10?`
    : pick === gap ? 'A perfect fit!' : pick < gap ? `${gap - pick} short. There is still a gap!` : `${pick - gap} too long!`;
  return (
    <div className="bridge">
      <div className="bridge-row">
        {Array.from({ length: 10 }, (_, i) => {
          const placed = i < a;
          const filled = !placed && pick !== null && i - a < pick;
          return <span key={i} className={`plank${placed ? ' on' : ''}${filled ? ' try' : ''}${filled && pick === gap ? ' fit' : ''}`}>{i + 1}</span>;
        })}
        {Array.from({ length: over }, (_, i) => <span key={`o${i}`} className="plank over">✖</span>)}
      </div>
      <div className="bridge-water" aria-hidden>🌊🌊🌊🌊🌊</div>
      <p className="bridge-msg">{msg}</p>
    </div>
  );
}
