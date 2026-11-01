import { useMemo } from 'react';
import type { Theme } from '../core/types';

/* Original illustrations (no trademarked characters). Everything is inline SVG so it works offline. */

const wave = (y: number, amp: number, n = 12) => `M-400 ${y} q100 ${-amp} 200 0 ${'t200 0 '.repeat(n)}V900 H-400 Z`;

function PirateSky() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="psky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2ea8dc" /><stop offset=".55" stopColor="#94e2f7" /><stop offset="1" stopColor="#fff2c6" />
        </linearGradient>
        <linearGradient id="psea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22b2cf" /><stop offset="1" stopColor="#094660" />
        </linearGradient>
        <radialGradient id="psun">
          <stop offset="0" stopColor="#fff9cc" /><stop offset=".45" stopColor="#ffe27a" stopOpacity=".85" /><stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#psky)" />
      <circle cx="1290" cy="200" r="200" fill="url(#psun)" />
      <circle cx="1290" cy="200" r="64" fill="#fff7be" />
      {[[200, 150, 1], [760, 90, 0.75], [1050, 230, 0.88]].map(([x, y, s], i) => (
        <g key={i} className={`cloud c${i}`} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity=".94">
          <ellipse cx="0" cy="0" rx="92" ry="36" /><ellipse cx="-52" cy="-18" rx="52" ry="32" /><ellipse cx="32" cy="-30" rx="60" ry="38" />
        </g>
      ))}
      <path d="M0 540 q120 -90 240 -20 q80 -50 170 20Z M1100 540 q100 -70 200 -10 q110 -80 300 10Z" fill="#6fb9cf" opacity=".55" />
      <rect y="520" width="1600" height="380" fill="url(#psea)" />
      <g className="ship" transform="translate(330 535)">
        <rect x="-5" y="-190" width="10" height="190" rx="4" fill="#5a3416" />
        <path d="M8 -180 Q115 -120 8 -40Z" fill="#fff6e0" /><path d="M-8 -165 Q-95 -115 -8 -52Z" fill="#ffefc9" />
        <path d="M4 -194 l66 14 l-66 14Z" fill="#e63946" />
        <path d="M-120 -4 H120 L84 52 H-84Z" fill="#8a5126" /><path d="M-120 -4 H120 L116 8 H-116Z" fill="#c98a4b" />
        <circle cx="-40" cy="22" r="8" fill="#ffd166" stroke="#3b2410" strokeWidth="3" />
        <circle cx="0" cy="22" r="8" fill="#ffd166" stroke="#3b2410" strokeWidth="3" />
        <circle cx="40" cy="22" r="8" fill="#ffd166" stroke="#3b2410" strokeWidth="3" />
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

function PupsSky() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="pupsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e88e5" /><stop offset=".58" stopColor="#7ad7f0" /><stop offset="1" stopColor="#dbf9f4" />
        </linearGradient>
        <linearGradient id="pupbay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2ec4b6" /><stop offset="1" stopColor="#0a5c99" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#pupsky)" />
      {/* Rainbow arc over Adventure Bay */}
      <g opacity=".45" fill="none" strokeWidth="18">
        <path d="M180 560 A520 520 0 0 1 1180 560" stroke="#ff595e" />
        <path d="M198 560 A502 502 0 0 1 1162 560" stroke="#ffca3a" />
        <path d="M216 560 A484 484 0 0 1 1144 560" stroke="#8ac926" />
        <path d="M234 560 A466 466 0 0 1 1126 560" stroke="#1982c4" />
      </g>
      {[[240, 140, 1.05], [780, 110, 0.85], [1220, 170, 0.9]].map(([x, y, s], i) => (
        <g key={i} className={`cloud c${i}`} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity=".95">
          <ellipse cx="0" cy="0" rx="90" ry="34" /><ellipse cx="-48" cy="-18" rx="50" ry="30" /><ellipse cx="32" cy="-28" rx="56" ry="34" />
        </g>
      ))}
      {/* Green coastal hills & Lookout Tower */}
      <path d="M-40 560 Q220 420 540 550 T1180 530 Q1420 440 1640 550 V700 H-40Z" fill="#52b788" />
      <path d="M-40 590 Q360 470 760 580 T1640 560 V700 H-40Z" fill="#40916c" />
      <g transform="translate(1310 470)">
        <rect x="-26" y="-130" width="52" height="140" rx="12" fill="#f8f9fa" stroke="#adb5bd" strokeWidth="4" />
        <path d="M-58 -120 H58 L44 -76 H-44Z" fill="#ef233c" />
        <rect x="-48" y="-154" width="96" height="38" rx="16" fill="#38bdf8" stroke="#fff" strokeWidth="5" />
        <path d="M-64 -154 Q0 -198 64 -154Z" fill="#ef233c" />
        <circle cx="0" cy="-98" r="16" fill="#ffbe0b" stroke="#fff" strokeWidth="3" />
      </g>
      <rect y="580" width="1600" height="320" fill="url(#pupbay)" />
      <path className="wave w1" d={wave(620, 26)} fill="#38d9a9" opacity=".45" />
      <path className="wave w2" d={wave(690, 32)} fill="#15aabf" opacity=".6" />
    </svg>
  );
}

function RescueSky() {
  const glowDots = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    x: ((i * 197) % 1540) + 30,
    y: ((i * 131) % 680) + 80,
    r: 3 + (i % 4) * 1.5,
    d: (i % 7) * 0.6,
  })), []);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f3d3e" /><stop offset=".5" stopColor="#146c60" /><stop offset="1" stopColor="#99f6e4" />
        </linearGradient>
        <linearGradient id="raurora" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#34d399" stopOpacity="0" />
          <stop offset=".35" stopColor="#a7f3d0" stopOpacity=".45" />
          <stop offset=".7" stopColor="#f472b6" stopOpacity=".38" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#rsky)" />
      <path className="wave w1" d="M-200 220 Q260 90 720 210 T1700 180 L1700 320 Q1140 240 680 330 T-200 290Z" fill="url(#raurora)" />
      {/* Distant misty mountains */}
      <path d="M-50 620 L220 330 L480 560 L790 290 L1110 550 L1380 340 L1650 620 Z" fill="#115e59" opacity=".65" />
      <path d="M160 640 L430 390 L690 610 L1020 370 L1310 610 L1650 450 V900 H-50 V640 Z" fill="#0f524c" opacity=".85" />
      {/* Enchanted forest ridge */}
      <path d="M-40 670 Q400 580 840 660 T1640 640 V900 H-40Z" fill="#064e3b" />
      {glowDots.map((g, i) => (
        <circle key={i} className="star" style={{ animationDelay: `${g.d}s` }} cx={g.x} cy={g.y} r={g.r} fill={i % 3 === 0 ? '#fde68a' : '#a7f3d0'} />
      ))}
    </svg>
  );
}

export function Scenery({ themeId }: { themeId: string }) {
  return (
    <div className="scenery" aria-hidden>
      {themeId === 'super' ? <SuperSky /> : themeId === 'pups' ? <PupsSky /> : themeId === 'rescue' ? <RescueSky /> : <PirateSky />}
    </div>
  );
}

/** Original helper characters: Pip (pirate parrot), Bolt (super robot), Scout (rescue pup), Blaze (creature dragon-unicorn). */
export function HelperAvatar({
  theme,
  size = 56,
  talking = false,
  mood = 'idle',
}: {
  theme: Theme;
  size?: number;
  talking?: boolean;
  mood?: 'idle' | 'talking' | 'cheer';
}) {
  const cls = `helper-art${talking ? ' talking' : ''}${mood === 'cheer' ? ' cheer' : ''}`;
  if (theme.id === 'super') {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
        <defs>
          <linearGradient id="rbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6ecff" /><stop offset="1" stopColor="#a9b8ff" /></linearGradient>
        </defs>
        <line x1="50" y1="8" x2="50" y2="22" stroke="#6a3df0" strokeWidth="4" strokeLinecap="round" />
        <circle className="glow" cx="50" cy="8" r="6.5" fill="#ffd23f" stroke="#fff" strokeWidth="2" />
        <rect x="13" y="40" width="10" height="18" rx="5" fill="#6a3df0" /><rect x="77" y="40" width="10" height="18" rx="5" fill="#6a3df0" />
        <rect x="22" y="22" width="56" height="50" rx="18" fill="url(#rbody)" stroke="#4a2fc0" strokeWidth="3.5" />
        <rect x="29" y="33" width="42" height="25" rx="12" fill="#1b1456" />
        <g className="blink"><circle cx="42" cy="46" r="6.5" fill="#59f0ff" /><circle cx="58" cy="46" r="6.5" fill="#59f0ff" /></g>
        <circle cx="44" cy="44" r="2.2" fill="#fff" /><circle cx="60" cy="44" r="2.2" fill="#fff" />
        <path className="mouth" d="M41 64 q9 8 18 0" stroke="#4a2fc0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <rect x="32" y="74" width="36" height="20" rx="8" fill="#6a3df0" stroke="#4a2fc0" strokeWidth="3" />
        <path d="M52 77 l-8 9 h6 l-2 7 l9 -11 h-6Z" fill="#ffd23f" />
      </svg>
    );
  }
  if (theme.id === 'pups') {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
        <defs>
          <linearGradient id="pupfur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6bd60" /><stop offset="1" stopColor="#d9822b" /></linearGradient>
          <linearGradient id="puphat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff4d6d" /><stop offset="1" stopColor="#d90429" /></linearGradient>
        </defs>
        {/* Floppy ears */}
        <ellipse cx="22" cy="52" rx="11" ry="22" fill="#7f4f24" transform="rotate(18 22 52)" />
        <ellipse cx="78" cy="52" rx="11" ry="22" fill="#7f4f24" transform="rotate(-18 78 52)" />
        {/* Head & cheeks */}
        <circle cx="50" cy="54" r="28" fill="url(#pupfur)" stroke="#7f4f24" strokeWidth="2.5" />
        <ellipse cx="50" cy="63" rx="18" ry="14" fill="#fff3dc" />
        {/* Eyes */}
        <g className="blink">
          <circle cx="39" cy="49" r="6.5" fill="#fff" /><circle cx="40" cy="49" r="4" fill="#222" /><circle cx="41.5" cy="47.5" r="1.5" fill="#fff" />
          <circle cx="61" cy="49" r="6.5" fill="#fff" /><circle cx="60" cy="49" r="4" fill="#222" /><circle cx="61.5" cy="47.5" r="1.5" fill="#fff" />
        </g>
        {/* Cute nose & happy mouth */}
        <ellipse cx="50" cy="58" rx="6.5" ry="4.8" fill="#2b2d42" />
        <path className="beak" d="M42 66 q8 9 16 0" stroke="#7f4f24" strokeWidth="3.2" fill="#ff758f" strokeLinecap="round" />
        {/* Rescue helmet with gold badge */}
        <path d="M23 36 Q50 10 77 36 Z" fill="url(#puphat)" stroke="#8d0801" strokeWidth="2.5" />
        <rect x="20" y="33" width="60" height="7" rx="3.5" fill="#ffbe0b" />
        <polygon className="glow" points="50,17 56,23 50,31 44,23" fill="#ffbe0b" stroke="#fff" strokeWidth="1.5" />
        {/* Collar & badge */}
        <rect x="33" y="79" width="34" height="8" rx="4" fill="#1982c4" />
        <circle cx="50" cy="88" r="6" fill="#ffbe0b" stroke="#d9822b" strokeWidth="1.8" />
      </svg>
    );
  }
  if (theme.id === 'rescue') {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
        <defs>
          <linearGradient id="drgbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6ee7b7" /><stop offset="1" stopColor="#10b981" /></linearGradient>
          <linearGradient id="drghorn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fef08a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        </defs>
        {/* Little wings */}
        <path d="M24 58 Q6 42 14 72 Q22 70 28 66Z" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
        <path d="M76 58 Q94 42 86 72 Q78 70 72 66Z" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
        {/* Body & belly */}
        <ellipse cx="50" cy="68" rx="23" ry="22" fill="url(#drgbody)" stroke="#047857" strokeWidth="2.5" />
        <ellipse cx="50" cy="70" rx="14" ry="15" fill="#fef08a" />
        {/* Head */}
        <circle cx="50" cy="42" r="22" fill="url(#drgbody)" stroke="#047857" strokeWidth="2.5" />
        {/* Magical unicorn horn */}
        <polygon className="glow" points="50,5 43,24 57,24" fill="url(#drghorn)" stroke="#fff" strokeWidth="1.5" />
        {/* Eyes & smile */}
        <g className="blink">
          <circle cx="41" cy="40" r="6" fill="#fff" /><circle cx="42" cy="40" r="3.6" fill="#1e1b4b" /><circle cx="43" cy="38.5" r="1.4" fill="#fff" />
          <circle cx="59" cy="40" r="6" fill="#fff" /><circle cx="58" cy="40" r="3.6" fill="#1e1b4b" /><circle cx="59" cy="38.5" r="1.4" fill="#fff" />
        </g>
        <circle cx="34" cy="46" r="3.5" fill="#f472b6" opacity=".65" />
        <circle cx="66" cy="46" r="3.5" fill="#f472b6" opacity=".65" />
        <path className="beak" d="M43 49 q7 7 14 0" stroke="#065f46" strokeWidth="3" fill="none" strokeLinecap="round" />
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

/** Collectible icon per theme. Sizes with the surrounding font-size. */
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
  if (themeId === 'pups') {
    return (
      <svg className={`collect ${className}`} viewBox="0 0 40 40" width="1em" height="1em" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="#ef233c" stroke="#ffbe0b" strokeWidth="3.5" />
        <ellipse cx="20" cy="24" rx="7" ry="5.5" fill="#ffbe0b" />
        <circle cx="12.5" cy="15.5" r="3" fill="#ffbe0b" />
        <circle cx="17.5" cy="12.5" r="3" fill="#ffbe0b" />
        <circle cx="22.5" cy="12.5" r="3" fill="#ffbe0b" />
        <circle cx="27.5" cy="15.5" r="3" fill="#ffbe0b" />
      </svg>
    );
  }
  if (themeId === 'rescue') {
    return (
      <svg className={`collect ${className}`} viewBox="0 0 40 40" width="1em" height="1em" aria-hidden>
        <polygon points="20,3 34,14 28,36 12,36 6,14" fill="#34d399" stroke="#ecfdf5" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="20,3 28,14 20,36 12,14" fill="#a7f3d0" opacity=".65" />
        <circle cx="15" cy="12" r="2.5" fill="#fff" />
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

/** Winding dotted treasure trail connecting the islands on the Hub map. */
export function MapTrail({ themeId }: { themeId: string }) {
  const stroke = themeId === 'super' ? '#59f0ff' : themeId === 'pups' ? '#fff' : themeId === 'rescue' ? '#fde68a' : '#fff3b0';
  return (
    <svg className="map-trail" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden>
      <path
        d="M 90 110 C 240 25, 340 165, 500 85 C 660 10, 760 165, 910 95"
        fill="none"
        stroke={stroke}
        strokeWidth="7"
        strokeDasharray="16 18"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  );
}

/** Island platform: sand + water ring (pirate/pups), glowing pad (super), or mossy stone (rescue). */
export function IslandBase({ themeId, tone }: { themeId: string; tone: string }) {
  if (themeId === 'super') {
    return (
      <svg className="island-base" viewBox="0 0 240 150" aria-hidden>
        <ellipse cx="120" cy="124" rx="86" ry="14" fill="#000" opacity=".28" />
        <ellipse cx="120" cy="100" rx="98" ry="32" fill={tone} opacity=".38" />
        <path d="M32 84 Q120 128 208 84 L196 108 Q120 146 44 108Z" fill="#2a1a8a" />
        <ellipse cx="120" cy="84" rx="92" ry="30" fill="#4b33c2" stroke={tone} strokeWidth="5" />
        <ellipse cx="120" cy="82" rx="70" ry="21" fill={tone} opacity=".32" />
      </svg>
    );
  }
  return (
    <svg className="island-base" viewBox="0 0 240 150" aria-hidden>
      <ellipse cx="120" cy="118" rx="114" ry="27" fill="#bdf1ff" opacity=".5" />
      <ellipse cx="120" cy="116" rx="94" ry="20" fill="#fff" opacity=".55" />
      <path d="M22 100 Q40 52 120 50 Q200 52 218 100 Q218 126 120 128 Q22 126 22 100Z" fill={tone} stroke="#fff" strokeWidth="3" strokeOpacity=".55" />
      <path d="M26 98 Q42 56 120 54 Q198 56 214 98 Q188 76 120 76 Q52 76 26 98Z" fill="#fff" opacity=".35" />
      <path d="M40 112 Q120 132 200 112" stroke="#000" strokeWidth="3.5" opacity=".14" fill="none" />
    </svg>
  );
}

export function Confetti({ count = 42 }: { count?: number }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2.2 + Math.random() * 1.8, rot: Math.random() * 360,
    color: ['#ffd23f', '#ff4d6d', '#4cc9f0', '#80ed99', '#b388ff', '#ff9f1c'][i % 6], w: 9 + Math.random() * 9,
  })), [count]);
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, background: b.color, width: b.w, height: b.w * 0.55, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}
