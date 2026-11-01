import { useMemo } from 'react';
import type { Theme } from '../core/types';

/* Original illustrations (no trademarked characters). Everything is inline SVG so it works offline. */

const wave = (y: number, amp: number, n = 12) => `M-400 ${y} q100 ${-amp} 200 0 ${'t200 0 '.repeat(n)}V900 H-400 Z`;

function PirateSky() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="psky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb8e6" /><stop offset=".55" stopColor="#9fe0f2" /><stop offset="1" stopColor="#fff0c9" />
        </linearGradient>
        <linearGradient id="psea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2ab0cc" /><stop offset="1" stopColor="#0b4f6c" />
        </linearGradient>
        <radialGradient id="psun">
          <stop offset="0" stopColor="#fff7c2" /><stop offset=".45" stopColor="#ffe27a" stopOpacity=".8" /><stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#psky)" />
      <circle cx="1290" cy="200" r="190" fill="url(#psun)" />
      <circle cx="1290" cy="200" r="60" fill="#fff6b8" />
      {[[200, 150, 1], [760, 90, 0.7], [1050, 230, 0.85]].map(([x, y, s], i) => (
        <g key={i} className={`cloud c${i}`} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity=".92">
          <ellipse cx="0" cy="0" rx="90" ry="34" /><ellipse cx="-50" cy="-18" rx="50" ry="30" /><ellipse cx="30" cy="-30" rx="58" ry="36" />
        </g>
      ))}
      <path d="M0 540 q120 -90 240 -20 q80 -50 170 20Z M1100 540 q100 -70 200 -10 q110 -80 300 10Z" fill="#6fb9cf" opacity=".55" />
      <rect y="520" width="1600" height="380" fill="url(#psea)" />
      <g className="ship" transform="translate(330 535)">
        <rect x="-5" y="-190" width="10" height="190" rx="4" fill="#5a3416" />
        <path d="M8 -180 Q110 -120 8 -40Z" fill="#fff6e0" /><path d="M-8 -165 Q-90 -115 -8 -52Z" fill="#ffefc9" />
        <path d="M4 -194 l62 14 l-62 14Z" fill="#e63946" />
        <path d="M-120 -4 H120 L84 52 H-84Z" fill="#8a5126" /><path d="M-120 -4 H120 L116 8 H-116Z" fill="#c98a4b" />
        <circle cx="-40" cy="22" r="7" fill="#3b2410" /><circle cx="0" cy="22" r="7" fill="#3b2410" /><circle cx="40" cy="22" r="7" fill="#3b2410" />
      </g>
      <path className="wave w1" d={wave(590, 30)} fill="#2aa5c4" opacity=".55" />
      <path className="wave w2" d={wave(660, 36)} fill="#1b86a8" opacity=".7" />
      <path className="wave w3" d={wave(740, 42)} fill="#0e6283" opacity=".85" />
    </svg>
  );
}

function SuperSky() {
  const { stars, far, near } = useMemo(() => {
    let s = 7;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const stars = Array.from({ length: 70 }, () => ({ x: r() * 1600, y: r() * 520, r: 1 + r() * 2.4, d: r() * 4 }));
    const build = (minH: number, maxH: number, minW: number, maxW: number) => {
      const out: { x: number; w: number; h: number; win: [number, number][] }[] = [];
      for (let x = -20; x < 1620;) {
        const w = minW + r() * (maxW - minW);
        const h = minH + r() * (maxH - minH);
        const win: [number, number][] = [];
        for (let wy = 20; wy < h - 14; wy += 26) for (let wx = 10; wx < w - 14; wx += 22) if (r() > 0.55) win.push([wx, wy]);
        out.push({ x, w, h, win });
        x += w + 4;
      }
      return out;
    };
    return { stars, far: build(160, 340, 60, 120), near: build(90, 230, 80, 150) };
  }, []);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141b55" /><stop offset=".55" stopColor="#5a35d6" /><stop offset="1" stopColor="#ff7eb6" />
        </linearGradient>
        <radialGradient id="smoon"><stop offset="0" stopColor="#fffbe0" /><stop offset=".6" stopColor="#fff0a8" /><stop offset="1" stopColor="#fff0a8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#ssky)" />
      {stars.map((s, i) => <circle key={i} className="star" style={{ animationDelay: `${s.d}s` }} cx={s.x} cy={s.y} r={s.r} fill="#fff" />)}
      <circle cx="1250" cy="190" r="150" fill="url(#smoon)" opacity=".6" /><circle cx="1250" cy="190" r="62" fill="#fff6c4" />
      <circle cx="1230" cy="176" r="12" fill="#f2e08c" opacity=".7" /><circle cx="1272" cy="210" r="8" fill="#f2e08c" opacity=".7" />
      <path className="shoot" d="M200 120 L330 70" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(0 560)">
        {far.map((b, i) => <rect key={i} x={b.x} y={340 - b.h} width={b.w} height={b.h + 10} fill="#2c1c7a" opacity=".85" />)}
      </g>
      <g transform="translate(0 600)">
        {near.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${300 - b.h})`}>
            <rect width={b.w} height={b.h + 10} fill="#1a1050" />
            {b.win.map(([x, y], k) => <rect key={k} x={x} y={y} width="9" height="13" rx="2" fill="#ffd23f" opacity=".85" />)}
          </g>
        ))}
      </g>
    </svg>
  );
}

export function Scenery({ themeId }: { themeId: string }) {
  return <div className="scenery" aria-hidden>{themeId === 'super' ? <SuperSky /> : <PirateSky />}</div>;
}

/** Original helper characters: a parrot (pirate) and a little robot (super). */
export function HelperAvatar({ theme, size = 56, talking = false }: { theme: Theme; size?: number; talking?: boolean }) {
  const cls = `helper-art${talking ? ' talking' : ''}`;
  if (theme.id === 'super') {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
        <defs>
          <linearGradient id="rbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6ecff" /><stop offset="1" stopColor="#a9b8ff" /></linearGradient>
        </defs>
        <line x1="50" y1="8" x2="50" y2="22" stroke="#6a3df0" strokeWidth="4" strokeLinecap="round" />
        <circle className="glow" cx="50" cy="8" r="6" fill="#ffd23f" stroke="#fff" strokeWidth="1.5" />
        <rect x="14" y="40" width="9" height="18" rx="4" fill="#6a3df0" /><rect x="77" y="40" width="9" height="18" rx="4" fill="#6a3df0" />
        <rect x="22" y="22" width="56" height="50" rx="18" fill="url(#rbody)" stroke="#4a2fc0" strokeWidth="3" />
        <rect x="30" y="34" width="40" height="24" rx="12" fill="#1b1456" />
        <g className="blink"><circle cx="42" cy="46" r="6" fill="#59f0ff" /><circle cx="58" cy="46" r="6" fill="#59f0ff" /></g>
        <circle cx="44" cy="44" r="2" fill="#fff" /><circle cx="60" cy="44" r="2" fill="#fff" />
        <path className="mouth" d="M43 64 q7 6 14 0" stroke="#4a2fc0" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="32" y="74" width="36" height="20" rx="8" fill="#6a3df0" stroke="#4a2fc0" strokeWidth="3" />
        <path d="M52 77 l-8 9 h6 l-2 7 l9 -11 h-6Z" fill="#ffd23f" />
      </svg>
    );
  }
  return (
    <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
      <defs>
        <linearGradient id="pgreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#58d46a" /><stop offset="1" stopColor="#2a9d4a" /></linearGradient>
      </defs>
      <ellipse cx="30" cy="84" rx="9" ry="20" fill="#e63946" transform="rotate(25 30 84)" />
      <ellipse cx="40" cy="88" rx="8" ry="19" fill="#2f7fe0" transform="rotate(10 40 88)" />
      <ellipse cx="52" cy="62" rx="27" ry="31" fill="url(#pgreen)" />
      <ellipse cx="60" cy="68" rx="15" ry="21" fill="#ffe27a" />
      <ellipse cx="38" cy="64" rx="13" ry="22" fill="#2a9d4a" transform="rotate(-12 38 64)" />
      <ellipse cx="34" cy="78" rx="7" ry="9" fill="#2f7fe0" transform="rotate(-12 34 78)" />
      <circle cx="54" cy="32" r="21" fill="url(#pgreen)" />
      <path d="M32 28 Q54 6 76 28 Q54 20 32 28Z" fill="#e63946" />
      <circle cx="76" cy="26" r="5" fill="#e63946" /><path d="M78 26 l12 6 l-9 3Z" fill="#e63946" />
      <g className="blink"><circle cx="62" cy="33" r="8" fill="#fff" /><circle cx="64" cy="33" r="4" fill="#222" /><circle cx="65.5" cy="31.5" r="1.4" fill="#fff" /></g>
      <path className="beak" d="M70 38 Q92 38 84 56 Q76 52 70 46Z" fill="#ff9f1c" stroke="#d97d00" strokeWidth="1.5" />
      <path d="M44 92 v6 M60 92 v6" stroke="#ff9f1c" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Coin (pirate) or power spark (super). Sizes with the surrounding font-size. */
export function Collectible({ themeId, className = '' }: { themeId: string; className?: string }) {
  if (themeId === 'super') {
    return (
      <svg className={`collect ${className}`} viewBox="0 0 40 40" width="1em" height="1em" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="#2a1a8a" stroke="#8f7bff" strokeWidth="3" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="#5b3ed8" strokeWidth="1.5" />
        <path d="M23 6 L11 22 h8 l-3 12 L29 17 h-8Z" fill="#ffd23f" stroke="#fff3a8" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={`collect ${className}`} viewBox="0 0 40 40" width="1em" height="1em" aria-hidden>
      <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0a0" /><stop offset=".5" stopColor="#ffc933" /><stop offset="1" stopColor="#d98c00" /></linearGradient></defs>
      <circle cx="20" cy="20" r="18" fill="url(#gold)" stroke="#b36b00" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="#b36b00" strokeWidth="1.8" opacity=".7" />
      <path d="M20 11 l2.6 5.5 6 .8 -4.4 4.2 1.1 6 -5.3 -2.9 -5.3 2.9 1.1 -6 -4.4 -4.2 6 -.8Z" fill="#fff3b8" stroke="#b36b00" strokeWidth="1" strokeLinejoin="round" />
      <path d="M9 14 a13 13 0 0 1 9 -6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".85" />
    </svg>
  );
}

/** Island platform: sand + water ring (pirate) or glowing floating pad (super). */
export function IslandBase({ themeId, tone }: { themeId: string; tone: string }) {
  if (themeId === 'super') {
    return (
      <svg className="island-base" viewBox="0 0 240 150" aria-hidden>
        <ellipse cx="120" cy="124" rx="86" ry="14" fill="#000" opacity=".25" />
        <ellipse cx="120" cy="100" rx="96" ry="30" fill={tone} opacity=".35" />
        <path d="M32 84 Q120 128 208 84 L196 108 Q120 146 44 108Z" fill="#2a1a8a" />
        <ellipse cx="120" cy="84" rx="92" ry="30" fill="#4b33c2" stroke={tone} strokeWidth="4" />
        <ellipse cx="120" cy="82" rx="70" ry="21" fill={tone} opacity=".25" />
      </svg>
    );
  }
  return (
    <svg className="island-base" viewBox="0 0 240 150" aria-hidden>
      <ellipse cx="120" cy="116" rx="112" ry="26" fill="#bdf1ff" opacity=".45" />
      <ellipse cx="120" cy="116" rx="92" ry="19" fill="#bdf1ff" opacity=".55" />
      <path d="M24 100 Q40 56 120 54 Q200 56 216 100 Q216 124 120 126 Q24 124 24 100Z" fill={tone} />
      <path d="M24 100 Q40 56 120 54 Q200 56 216 100 Q190 78 120 78 Q50 78 24 100Z" fill="#fff" opacity=".28" />
      <path d="M40 112 Q120 132 200 112" stroke="#000" strokeWidth="3" opacity=".12" fill="none" />
    </svg>
  );
}

export function Confetti({ count = 36 }: { count?: number }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2.2 + Math.random() * 1.8, rot: Math.random() * 360,
    color: ['#ffd23f', '#ff4d6d', '#4cc9f0', '#80ed99', '#b388ff', '#ff9f1c'][i % 6], w: 8 + Math.random() * 8,
  })), [count]);
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, background: b.color, width: b.w, height: b.w * 0.5, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}
