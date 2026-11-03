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

function SpaceRangerSky() {
  const { stars, meteors } = useMemo(() => {
    let s = 19;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const stars = Array.from({ length: 90 }, () => ({ x: r() * 1600, y: r() * 560, r: 1.2 + r() * 2.8, d: r() * 3.5 }));
    const meteors = [
      { x1: 200, y1: 80, x2: 360, y2: 150 },
      { x1: 1100, y1: 120, x2: 1280, y2: 210 },
    ];
    return { stars, meteors };
  }, []);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="srsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040817" /><stop offset=".5" stopColor="#0f172a" /><stop offset="1" stopColor="#311042" />
        </linearGradient>
        <radialGradient id="srnebula" cx="70%" cy="30%" r="50%">
          <stop offset="0" stopColor="#a855f7" stopOpacity=".45" />
          <stop offset=".5" stopColor="#06b6d4" stopOpacity=".2" />
          <stop offset="1" stopColor="#040817" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="srplanet">
          <stop offset="0" stopColor="#38ef7d" /><stop offset=".7" stopColor="#059669" /><stop offset="1" stopColor="#064e3b" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#srsky)" />
      <rect width="1600" height="900" fill="url(#srnebula)" />
      {stars.map((st, i) => (
        <circle key={i} className="star" style={{ animationDelay: `${st.d}s` }} cx={st.x} cy={st.y} r={st.r} fill="#fff" />
      ))}
      {meteors.map((m, i) => (
        <line key={i} className="shoot" x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#38ef7d" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      {/* Giant Ringed Planet */}
      <g transform="translate(1300 240)">
        <ellipse cx="0" cy="0" rx="90" ry="24" fill="none" stroke="#a7f3d0" strokeWidth="12" opacity=".4" transform="rotate(-22)" />
        <circle cx="0" cy="0" r="60" fill="url(#srplanet)" />
        <ellipse cx="0" cy="0" rx="90" ry="24" fill="none" stroke="#6ee7b7" strokeWidth="6" opacity=".8" transform="rotate(-22)" />
      </g>
      {/* Distant Star Command Space Station */}
      <g transform="translate(260 200) scale(0.85)" opacity=".85">
        <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="#38ef7d" strokeWidth="3" />
        <line x1="-70" y1="0" x2="70" y2="0" stroke="#38ef7d" strokeWidth="4" />
        <rect x="-65" y="-18" width="30" height="36" rx="4" fill="#0284c7" stroke="#38ef7d" strokeWidth="2" />
        <rect x="35" y="-18" width="30" height="36" rx="4" fill="#0284c7" stroke="#38ef7d" strokeWidth="2" />
        <circle cx="0" cy="0" r="10" fill="#38ef7d" />
      </g>
      {/* Cosmic horizon / Launch platform */}
      <path d="M-50 640 L300 580 L800 620 L1300 570 L1650 630 V900 H-50 Z" fill="#090d16" />
      <path d="M-50 690 L400 660 L900 690 L1400 650 L1650 690 V900 H-50 Z" fill="#111827" />
    </svg>
  );
}

function WesternSky() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c1d95" /><stop offset=".35" stopColor="#be185d" /><stop offset=".7" stopColor="#ea580c" /><stop offset="1" stopColor="#fef08a" />
        </linearGradient>
        <radialGradient id="wsun">
          <stop offset="0" stopColor="#fffbeb" /><stop offset=".4" stopColor="#fde047" stopOpacity=".9" /><stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#wsky)" />
      {/* Sunset sun */}
      <circle cx="1200" cy="380" r="160" fill="url(#wsun)" />
      <circle cx="1200" cy="380" r="54" fill="#fffbeb" />
      {/* Evening Stars */}
      {[[180, 110], [420, 80], [780, 140], [1420, 100]].map(([x, y], i) => (
        <polygon key={i} className="star" points={`${x},${y-8} ${x+2},${y-2} ${x+8},${y} ${x+2},${y+2} ${x},${y+8} ${x-2},${y+2} ${x-8},${y} ${x-2},${y-2}`} fill="#fff" />
      ))}
      {/* Sandstone Mesas and Buttes */}
      <path d="M-60 620 L80 440 H280 L360 620 Z" fill="#78350f" opacity=".7" />
      <path d="M720 620 L860 380 H1060 L1180 620 Z" fill="#78350f" opacity=".6" />
      <path d="M300 640 L450 480 H620 L740 640 Z" fill="#9a3412" opacity=".8" />
      <path d="M1120 640 L1260 460 H1440 L1560 640 Z" fill="#9a3412" opacity=".85" />
      {/* Rolling desert ground */}
      <path d="M-50 630 Q300 560 700 620 T1650 600 V900 H-50 Z" fill="#b45309" />
      <path d="M-50 680 Q450 620 950 670 T1650 650 V900 H-50 Z" fill="#7c2d12" />
      {/* Saguaro Cacti */}
      <g transform="translate(180 540)" fill="#365314">
        <rect x="-8" y="-110" width="16" height="110" rx="8" />
        <path d="M-8 -65 H-34 V-100 H-22 V-52 H-8 Z" />
        <path d="M8 -45 H34 V-80 H22 V-32 H8 Z" />
      </g>
      <g transform="translate(1420 570) scale(0.8)" fill="#365314">
        <rect x="-8" y="-110" width="16" height="110" rx="8" />
        <path d="M-8 -55 H-30 V-88 H-18 V-42 H-8 Z" />
        <path d="M8 -70 H30 V-105 H18 V-58 H8 Z" />
      </g>
    </svg>
  );
}

function DinoSky() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#064e3b" /><stop offset=".45" stopColor="#047857" /><stop offset=".8" stopColor="#f59e0b" /><stop offset="1" stopColor="#fef08a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#dsky)" />
      {/* Friendly Smoking Volcano */}
      <g transform="translate(420 440)">
        <polygon points="-220,260 0,0 220,260" fill="#44403c" />
        <polygon points="-50,0 0,-15 50,0 35,40 -35,40" fill="#ea580c" />
        {/* Puffs of smoke */}
        <circle cx="0" cy="-45" r="24" fill="#f5f5f4" opacity=".6" />
        <circle cx="28" cy="-80" r="34" fill="#f5f5f4" opacity=".5" />
        <circle cx="65" cy="-125" r="42" fill="#f5f5f4" opacity=".4" />
      </g>
      {/* Distant Pterodactyl */}
      <path d="M1100 180 Q1120 160 1140 180 Q1160 160 1180 180 Q1150 170 1140 195 Q1130 170 1100 180 Z" fill="#292524" />
      {/* Lush jungle ridge */}
      <path d="M-50 630 Q350 540 800 620 T1650 590 V900 H-50 Z" fill="#15803d" />
      <path d="M-50 680 Q500 610 1000 660 T1650 640 V900 H-50 Z" fill="#166534" />
    </svg>
  );
}

export function Scenery({ themeId }: { themeId: string }) {
  return (
    <div className="scenery" aria-hidden>
      {themeId === 'space-ranger' ? <SpaceRangerSky /> :
       themeId === 'western' ? <WesternSky /> :
       themeId === 'dino' ? <DinoSky /> :
       themeId === 'super' ? <SuperSky /> :
       themeId === 'pups' ? <PupsSky /> :
       themeId === 'rescue' ? <RescueSky /> :
       <PirateSky />}
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
  if (theme.id === 'space-ranger') {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
        <defs>
          <linearGradient id="bzsuit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#cbd5e1" /></linearGradient>
          <linearGradient id="bzarmor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4ade80" /><stop offset="1" stopColor="#16a34a" /></linearGradient>
          <linearGradient id="bzhood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c084fc" /><stop offset="1" stopColor="#7e22ce" /></linearGradient>
          <linearGradient id="bzglass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a5f3fc" stopOpacity=".55" /><stop offset="1" stopColor="#38bdf8" stopOpacity=".15" /></linearGradient>
        </defs>
        {/* Space ranger jet wings folded behind */}
        <polygon points="12,48 2,34 16,38" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <polygon points="88,48 98,34 84,38" fill="#22c55e" stroke="#166534" strokeWidth="1.5" />
        {/* White shoulders */}
        <circle cx="24" cy="74" r="14" fill="url(#bzsuit)" stroke="#94a3b8" strokeWidth="2.5" />
        <circle cx="76" cy="74" r="14" fill="url(#bzsuit)" stroke="#94a3b8" strokeWidth="2.5" />
        {/* Green torso armor */}
        <path d="M22 66 Q50 60 78 66 L74 94 Q50 98 26 94 Z" fill="url(#bzarmor)" stroke="#15803d" strokeWidth="2.5" />
        {/* Buttons on chest */}
        <circle cx="36" cy="78" r="4.2" fill="#3b82f6" />
        <circle cx="46" cy="78" r="4.2" fill="#ef4444" />
        <circle cx="56" cy="78" r="4.2" fill="#eab308" />
        {/* Laser Star badge */}
        <polygon points="66,74 69,82 63,82" fill="#ef4444" />
        {/* Purple Cowl / Hood */}
        <ellipse cx="50" cy="46" rx="24" ry="26" fill="url(#bzhood)" stroke="#581c87" strokeWidth="2" />
        {/* Face */}
        <ellipse cx="50" cy="47" rx="17" ry="19" fill="#fde68a" />
        {/* Eyes */}
        <g className="blink">
          <circle cx="43" cy="43" r="5" fill="#fff" /><circle cx="44" cy="43" r="3" fill="#1e293b" /><circle cx="45" cy="42" r="1.2" fill="#fff" />
          <circle cx="57" cy="43" r="5" fill="#fff" /><circle cx="56" cy="43" r="3" fill="#1e293b" /><circle cx="55" cy="42" r="1.2" fill="#fff" />
        </g>
        {/* Hero eyebrows */}
        <path d="M39 37 Q44 35 48 38" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M61 37 Q56 35 52 38" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Smile and famous chin swirl */}
        <path className="beak" d="M42 55 q8 6 16 0" stroke="#78350f" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M49 60 a2 2 0 1 0 2 0" stroke="#b45309" strokeWidth="1.8" fill="none" />
        {/* Transparent helmet dome */}
        <circle cx="50" cy="44" r="29" fill="url(#bzglass)" stroke="#38bdf8" strokeWidth="2.2" opacity=".75" />
        <ellipse cx="40" cy="30" rx="9" ry="4" fill="#fff" opacity=".6" transform="rotate(-25 40 30)" />
      </svg>
    );
  }
  if (theme.id === 'western') {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
        <defs>
          <linearGradient id="wdhat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#92400e" /><stop offset="1" stopColor="#451a03" /></linearGradient>
          <linearGradient id="wdshirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fef08a" /><stop offset="1" stopColor="#facc15" /></linearGradient>
        </defs>
        {/* Yellow plaid shirt & cowhide vest */}
        <path d="M22 72 Q50 68 78 72 L76 96 Q50 99 24 96 Z" fill="url(#wdshirt)" stroke="#ca8a04" strokeWidth="2" />
        <path d="M22 72 L36 96 H24 Z M78 72 L64 96 H76 Z" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
        <path d="M26 78 Q30 82 25 86 Z M73 80 Q69 85 75 90 Z" fill="#1e293b" />
        {/* Red Bandana */}
        <polygon points="42,67 58,67 50,77" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        {/* Gold Sheriff Badge */}
        <g transform="translate(34 78) scale(0.65)">
          <polygon className="glow" points="10,1 12,7 19,7 13,11 15,18 10,14 5,18 7,11 1,7 8,7" fill="#facc15" stroke="#b45309" strokeWidth="1.2" />
          <circle cx="10" cy="10" r="3" fill="#b45309" />
        </g>
        {/* Face */}
        <ellipse cx="50" cy="50" rx="19" ry="21" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
        <circle cx="36" cy="54" r="4" fill="#fca5a5" opacity=".5" />
        <circle cx="64" cy="54" r="4" fill="#fca5a5" opacity=".5" />
        {/* Eyes */}
        <g className="blink">
          <circle cx="43" cy="46" r="5" fill="#fff" /><circle cx="44" cy="46" r="3" fill="#451a03" /><circle cx="45" cy="45" r="1.2" fill="#fff" />
          <circle cx="57" cy="46" r="5" fill="#fff" /><circle cx="56" cy="46" r="3" fill="#451a03" /><circle cx="55" cy="45" r="1.2" fill="#fff" />
        </g>
        {/* Warm smile */}
        <path className="beak" d="M41 58 q9 8 18 0" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Tall Cowboy Hat */}
        <g transform="translate(0 -2)">
          {/* Hat crown with crease */}
          <path d="M34 32 Q32 10 46 14 Q50 16 54 14 Q68 10 66 32 Z" fill="#78350f" stroke="#451a03" strokeWidth="2.5" />
          <path d="M33 30 H67 V34 H33 Z" fill="#451a03" />
          {/* Wide curved hat brim */}
          <ellipse cx="50" cy="33" rx="38" ry="10" fill="#92400e" stroke="#451a03" strokeWidth="2.5" />
          <path d="M14 34 Q50 24 86 34" stroke="#b45309" strokeWidth="2" fill="none" />
        </g>
      </svg>
    );
  }
  if (theme.id === 'dino') {
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={theme.helper.name}>
        <defs>
          <linearGradient id="dnbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4ade80" /><stop offset="1" stopColor="#15803d" /></linearGradient>
        </defs>
        {/* T-Rex round body */}
        <ellipse cx="50" cy="68" rx="26" ry="24" fill="url(#dnbody)" stroke="#14532d" strokeWidth="2.5" />
        <ellipse cx="50" cy="72" rx="16" ry="17" fill="#bbf7d0" />
        {/* Tiny encouraging T-Rex arms */}
        <path d="M30 64 Q20 58 24 70" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M70 64 Q80 58 76 70" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Head and snout */}
        <ellipse cx="50" cy="42" rx="23" ry="21" fill="url(#dnbody)" stroke="#14532d" strokeWidth="2.5" />
        <ellipse cx="50" cy="49" rx="17" ry="12" fill="#86efac" />
        {/* Nostrils */}
        <circle cx="45" cy="44" r="2" fill="#14532d" />
        <circle cx="55" cy="44" r="2" fill="#14532d" />
        {/* Big cute dinosaur eyes */}
        <g className="blink">
          <circle cx="39" cy="34" r="7" fill="#fff" /><circle cx="40" cy="34" r="4.2" fill="#14532d" /><circle cx="41.5" cy="32.5" r="1.6" fill="#fff" />
          <circle cx="61" cy="34" r="7" fill="#fff" /><circle cx="60" cy="34" r="4.2" fill="#14532d" /><circle cx="61.5" cy="32.5" r="1.6" fill="#fff" />
        </g>
        {/* Big happy mouth with cute rounded teeth */}
        <path className="beak" d="M38 52 q12 10 24 0" stroke="#14532d" strokeWidth="3" fill="#f87171" strokeLinecap="round" />
        <polygon points="44,52 46,55 48,52" fill="#fff" />
        <polygon points="52,52 54,55 56,52" fill="#fff" />
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
  if (themeId === 'space-ranger') {
    return (
      <svg className={`collect ${className}`} viewBox="0 0 40 40" width="1em" height="1em" aria-hidden>
        <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" fill="#0f172a" stroke="#38ef7d" strokeWidth="3" />
        <polygon points="20,8 30,14 30,26 20,32 10,26 10,14" fill="#a855f7" opacity=".85" />
        <polygon points="20,11 23,17 29,17 24,21 26,27 20,24 14,27 16,21 11,17 17,17" fill="#38ef7d" />
      </svg>
    );
  }
  if (themeId === 'western') {
    return (
      <svg className={`collect ${className}`} viewBox="0 0 40 40" width="1em" height="1em" aria-hidden>
        <polygon points="20,4 24,15 35,15 26,22 29,33 20,26 11,33 14,22 5,15 16,15" fill="#facc15" stroke="#92400e" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="20" cy="4" r="2.2" fill="#92400e" />
        <circle cx="35" cy="15" r="2.2" fill="#92400e" />
        <circle cx="29" cy="33" r="2.2" fill="#92400e" />
        <circle cx="11" cy="33" r="2.2" fill="#92400e" />
        <circle cx="5" cy="15" r="2.2" fill="#92400e" />
        <circle cx="20" cy="19" r="4.5" fill="#ca8a04" stroke="#78350f" strokeWidth="1.5" />
      </svg>
    );
  }
  if (themeId === 'dino') {
    return (
      <svg className={`collect ${className}`} viewBox="0 0 40 40" width="1em" height="1em" aria-hidden>
        <ellipse cx="20" cy="22" rx="14" ry="17" fill="#fef08a" stroke="#15803d" strokeWidth="3" />
        <ellipse cx="16" cy="17" rx="3.5" ry="4.5" fill="#4ade80" />
        <ellipse cx="24" cy="25" rx="4" ry="3.5" fill="#4ade80" />
        <ellipse cx="18" cy="28" rx="2.5" ry="2.5" fill="#4ade80" />
      </svg>
    );
  }
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
  const stroke =
    themeId === 'space-ranger' ? '#38ef7d' :
    themeId === 'western' ? '#ffe400' :
    themeId === 'dino' ? '#52b788' :
    themeId === 'super' ? '#59f0ff' :
    themeId === 'pups' ? '#fff' :
    themeId === 'rescue' ? '#fde68a' : '#fff3b0';
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
  if (themeId === 'space-ranger') {
    return (
      <svg className="island-base" viewBox="0 0 240 150" aria-hidden>
        <ellipse cx="120" cy="122" rx="90" ry="15" fill="#000" opacity=".35" />
        <polygon points="120,54 204,74 204,104 120,124 36,104 36,74" fill="#0f172a" stroke="#38ef7d" strokeWidth="4" />
        <polygon points="120,60 196,78 196,98 120,116 44,98 44,78" fill={tone} opacity=".4" />
        <ellipse cx="120" cy="88" rx="60" ry="18" fill="#1e293b" stroke="#00f2fe" strokeWidth="2.5" />
      </svg>
    );
  }
  if (themeId === 'western') {
    return (
      <svg className="island-base" viewBox="0 0 240 150" aria-hidden>
        <ellipse cx="120" cy="122" rx="92" ry="16" fill="#000" opacity=".26" />
        <path d="M30 88 L60 62 H180 L210 88 L190 120 H50 Z" fill="#9a3412" stroke="#451a03" strokeWidth="3" />
        <ellipse cx="120" cy="80" rx="84" ry="24" fill={tone} stroke="#ffe400" strokeWidth="3" />
        <ellipse cx="120" cy="80" rx="64" ry="16" fill="#78350f" opacity=".2" />
      </svg>
    );
  }
  if (themeId === 'dino') {
    return (
      <svg className="island-base" viewBox="0 0 240 150" aria-hidden>
        <ellipse cx="120" cy="122" rx="94" ry="16" fill="#000" opacity=".28" />
        <path d="M26 94 Q40 56 120 54 Q200 56 214 94 Q170 124 120 126 Q70 124 26 94Z" fill="#14532d" stroke="#22c55e" strokeWidth="3" />
        <ellipse cx="120" cy="86" rx="82" ry="24" fill={tone} opacity=".85" />
        <path d="M40 76 Q70 64 90 78" stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M150 78 Q170 64 200 76" stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
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
