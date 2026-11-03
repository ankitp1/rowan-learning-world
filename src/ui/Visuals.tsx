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

export function MathVisual({ q, theme, hi, hintLevel = 0 }: { q: Question; theme: Theme; hi: number | null; hintLevel?: number }) {
  const e = theme.id;
  const lit = (cap: number, offset = 0) => (hi === null ? undefined : Math.max(0, Math.min(cap, hi - offset)));
  const a = q.a ?? 0;
  const b = q.b ?? 0;
  const showCoach = hintLevel > 0;

  switch (q.kind) {
    case 'count': {
      const n = q.n ?? 0;
      return (
        <div className="math-wrap">
          <CoinGrid n={n} themeId={e} lit={lit(n)} />
          {showCoach && (
            <div className="math-coach pop" role="region" aria-label="Math strategy cue">
              <span className="coach-badge">🧠 Easy Trick</span>
              <p>
                {n >= 5
                  ? `Each full row has 5! Start at 5${n >= 10 ? ', 10' : ''}${n >= 15 ? ', 15' : ''} and count the rest one by one.`
                  : 'Touch each one as you count: 1, 2, 3...'}
              </p>
            </div>
          )}
        </div>
      );
    }
    case 'compare':
      return (
        <div className="math-wrap">
          {q.support === 2 && !showCoach ? (
            <div className="bignum">{a} <span>?</span> {b}</div>
          ) : (
            <div className="piles">
              <CoinGrid n={a} themeId={e} lit={lit(a)} />
              <span className="vs">vs</span>
              <CoinGrid n={b} themeId={e} lit={lit(b, a)} alt />
            </div>
          )}
          {showCoach && (
            <div className="math-coach pop" role="region" aria-label="Math strategy cue">
              <span className="coach-badge">🧠 Compare Visual</span>
              <p>Left pile has <b>{a}</b>. Right pile has <b>{b}</b>. Look at which group has more rows!</p>
            </div>
          )}
        </div>
      );
    case 'add': {
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      const crossing10 = a < 10 && b < 10 && a + b > 10;
      const to10 = 10 - big;
      const rest = small - to10;
      return (
        <div className="math-wrap">
          {q.support === 2 && !showCoach && <div className="bignum">{a} + {b}</div>}
          {(q.support === 1 || (showCoach && q.support === 2)) && (
            <NumberLine from={a} dir={1} steps={b} hi={hi === null ? null : Math.max(0, hi - a)} />
          )}
          {(q.support === 0 || showCoach) && (
            <div className="piles">
              <CoinGrid n={a} themeId={e} lit={lit(a)} />
              <span className="vs">+</span>
              <CoinGrid n={b} themeId={e} lit={lit(b, a)} alt />
            </div>
          )}
          {showCoach && (
            <div className="math-coach pop" role="region" aria-label="Mental math strategy">
              {crossing10 ? (
                <>
                  <span className="coach-badge">🧠 Make 10 First Trick!</span>
                  <div className="coach-steps">
                    <span className="coach-pill">1️⃣ <b>{big} + {to10} = 10</b></span>
                    <span className="coach-arrow">→</span>
                    <span className="coach-pill">2️⃣ <b>10 + {rest} = {hintLevel >= 3 ? a + b : '?'}</b></span>
                  </div>
                  <TenFrame filled={big} extra={to10} themeId={e} />
                </>
              ) : (
                <>
                  <span className="coach-badge">🧠 Count-On In Your Head!</span>
                  <div className="coach-steps">
                    <span className="coach-brain">🧠 Hold <b>{big}</b></span>
                    {Array.from({ length: small }, (_, i) => {
                      const stepVal = big + i + 1;
                      const isLit = hi !== null && hi >= a + i + 1;
                      return (
                        <span key={i} className={`coach-hop${isLit ? ' lit' : ''}`}>
                          <Collectible themeId={e} />
                          <b>{hintLevel >= 2 || i < small - 1 ? stepVal : '?'}</b>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      );
    }
    case 'sub': {
      return (
        <div className="math-wrap">
          {q.support === 2 && !showCoach && <div className="bignum">{a} − {b}</div>}
          {(q.support === 1 || (showCoach && q.support === 2)) && (
            <NumberLine from={a} dir={-1} steps={b} hi={hi} />
          )}
          {(q.support === 0 || showCoach) && (
            <div className="piles">
              <CoinGrid n={a} themeId={e} gone={b} lit={lit(a - b)} />
              <span className="thief">{theme.thief.emoji}<small>takes {b}</small></span>
            </div>
          )}
          {showCoach && (
            <div className="math-coach pop" role="region" aria-label="Subtraction mental math strategy">
              <span className="coach-badge">🧠 Count Back {b} Steps!</span>
              <div className="coach-steps">
                <span className="coach-brain">Start at <b>{a}</b></span>
                {Array.from({ length: Math.min(b, 6) }, (_, i) => {
                  const val = a - (i + 1);
                  const showVal = hintLevel >= 3 || i < b - 1;
                  return (
                    <span key={i} className="coach-hop sub">
                      <small>−1</small>
                      <b>{showVal ? val : '?'}</b>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    case 'make10':
      return (
        <div className="math-wrap">
          {q.support === 2 && !showCoach ? (
            <div className="bignum">{a} + ? = 10</div>
          ) : (
            <TenFrame filled={a} extra={showCoach ? (hi ?? 10 - a) : hi} themeId={e} />
          )}
          {showCoach && (
            <div className="math-coach pop" role="region" aria-label="Make 10 strategy">
              <span className="coach-badge">🖐️ 10-Frame & Finger Trick</span>
              <p>A full box holds <b>10</b>. <b>{a}</b> spots are full — count the glowing empty spots to reach 10!</p>
            </div>
          )}
        </div>
      );
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
