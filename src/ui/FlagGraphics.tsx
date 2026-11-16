import type { ReactNode } from 'react';

export interface GraphicProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * 1. Canadian 11-Point Red Maple Leaf
 */
export function MapleLeafGraphic({ size = 80, color = '#d80621', className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill={color} className={className}>
      <path d="M50 8 L54 26 L62 20 L62 30 L74 24 L72 37 L85 38 L80 50 L89 54 L75 66 L72 63 L73 70 L54 64 L53 92 L47 92 L46 64 L27 70 L28 63 L25 66 L11 54 L20 50 L15 38 L28 37 L26 24 L38 30 L38 20 L46 26 Z" />
    </svg>
  );
}

/**
 * 2. Rising Sun Disc (Japan)
 */
export function SunDiscGraphic({ size = 80, color = '#bc002d', className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="44" fill={color} />
    </svg>
  );
}

/**
 * 3. Ashoka Chakra Wheel (India, 24 Spokes)
 */
export function AshokaChakraGraphic({ size = 80, color = '#000080', className }: GraphicProps) {
  const spokes = Array.from({ length: 24 }).map((_, i) => (
    <line
      key={i}
      x1="50"
      y1="50"
      x2={50 + 38 * Math.cos((i * 15 * Math.PI) / 180)}
      y2={50 + 38 * Math.sin((i * 15 * Math.PI) / 180)}
      stroke={color}
      strokeWidth="2.5"
    />
  ));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="41" fill="none" stroke={color} strokeWidth="5.5" />
      <circle cx="50" cy="50" r="8.5" fill={color} />
      {spokes}
    </svg>
  );
}

/**
 * 4. Sun of May (Argentina, Sol de Mayo with radiant face and 32 rays)
 */
export function SunOfMayGraphic({ size = 80, className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        return (
          <polygon
            key={i}
            points={`50,50 ${50 + 44 * Math.cos(angle - 0.09)},${50 + 44 * Math.sin(angle - 0.09)} ${50 + 44 * Math.cos(angle + 0.09)},${50 + 44 * Math.sin(angle + 0.09)}`}
            fill="#f6b40e"
            stroke="#b47d06"
            strokeWidth="0.8"
          />
        );
      })}
      <circle cx="50" cy="50" r="20" fill="#f6b40e" stroke="#b47d06" strokeWidth="2.5" />
      <circle cx="43" cy="46" r="3" fill="#855307" />
      <circle cx="57" cy="46" r="3" fill="#855307" />
      <path d="M48 51 Q50 54 52 51" stroke="#855307" strokeWidth="1.8" fill="none" />
      <path d="M42 58 Q50 64 58 58" stroke="#855307" strokeWidth="2.2" fill="none" />
    </svg>
  );
}

/**
 * 5. United States 50-Star Canton
 */
export function UsCantonGraphic({
  width = 130,
  height = 84,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  const rows = [6, 5, 6, 5, 6, 5, 6, 5, 6];
  return (
    <svg width={width} height={height} viewBox="0 0 130 84" className={className}>
      <rect width="130" height="84" fill="#002868" rx="4" />
      {rows.map((count, rowIdx) => {
        const y = 8 + rowIdx * 8;
        const xOffset = count === 5 ? 16 : 10;
        const spacing = (130 - 2 * xOffset) / (count - 1);
        return Array.from({ length: count }).map((_, colIdx) => (
          <text
            key={`${rowIdx}-${colIdx}`}
            x={xOffset + colIdx * spacing}
            y={y + 3}
            fill="#ffffff"
            fontSize="7"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="central"
          >
            ★
          </text>
        ));
      })}
    </svg>
  );
}

/**
 * 6. Greek Canton Cross
 */
export function GreekCantonGraphic({ size = 80, className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect width="100" height="100" fill="#0d5eaf" rx="6" />
      <rect x="38" y="0" width="24" height="100" fill="#ffffff" />
      <rect x="0" y="38" width="100" height="24" fill="#ffffff" />
    </svg>
  );
}

/**
 * 7. Swiss Equilateral Greek Cross
 */
export function SwissCrossGraphic({ size = 80, className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="37" y="15" width="26" height="70" fill="#ffffff" rx="3" />
      <rect x="15" y="37" width="70" height="26" fill="#ffffff" rx="3" />
    </svg>
  );
}

/**
 * 8. British Union Jack Canton & Crosses
 */
export function UnionJackGraphic({
  width = 120,
  height = 75,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 75" className={className}>
      <rect width="120" height="75" fill="#012169" rx="4" />
      <line x1="0" y1="0" x2="120" y2="75" stroke="#ffffff" strokeWidth="18" />
      <line x1="120" y1="0" x2="0" y2="75" stroke="#ffffff" strokeWidth="18" />
      <line x1="0" y1="0" x2="120" y2="75" stroke="#c8102e" strokeWidth="6" />
      <line x1="120" y1="0" x2="0" y2="75" stroke="#c8102e" strokeWidth="6" />
      <rect x="46" y="0" width="28" height="75" fill="#ffffff" />
      <rect x="0" y="24" width="120" height="27" fill="#ffffff" />
      <rect x="52" y="0" width="16" height="75" fill="#c8102e" />
      <rect x="0" y="29.5" width="120" height="16" fill="#c8102e" />
    </svg>
  );
}

/**
 * 9. Taegeuk Swirl (South Korea)
 */
export function TaegeukGraphic({ size = 80, className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="44" fill="#003478" />
      <path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6 Z" fill="#c60c30" />
      <circle cx="50" cy="28" r="22" fill="#c60c30" />
      <circle cx="50" cy="72" r="22" fill="#003478" />
    </svg>
  );
}

/**
 * 10. Blue Celestial Globe (Brazil)
 */
export function BrazilGlobeGraphic({ size = 80, className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="44" fill="#002776" stroke="#ffffff" strokeWidth="2" />
      <path d="M8 58 Q50 32 92 46 Q50 40 8 66 Z" fill="#ffffff" />
      <circle cx="50" cy="62" r="2.5" fill="#ffffff" />
      <circle cx="44" cy="70" r="2.2" fill="#ffffff" />
      <circle cx="56" cy="70" r="2.2" fill="#ffffff" />
      <circle cx="50" cy="78" r="2.2" fill="#ffffff" />
      <circle cx="53" cy="71" r="1.5" fill="#ffffff" />
    </svg>
  );
}

/**
 * 11. 5 Golden Stars (China)
 */
export function ChinaStarsGraphic({ size = 80, className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <text x="30" y="44" fill="#ffde00" fontSize="40" textAnchor="middle" dominantBaseline="central">★</text>
      <text x="66" y="18" fill="#ffde00" fontSize="14" textAnchor="middle" dominantBaseline="central">★</text>
      <text x="78" y="32" fill="#ffde00" fontSize="14" textAnchor="middle" dominantBaseline="central">★</text>
      <text x="78" y="52" fill="#ffde00" fontSize="14" textAnchor="middle" dominantBaseline="central">★</text>
      <text x="66" y="66" fill="#ffde00" fontSize="14" textAnchor="middle" dominantBaseline="central">★</text>
    </svg>
  );
}

/**
 * 12. Nordic Cross (Sweden, Norway)
 */
export function NordicCrossGraphic({
  width = 110,
  height = 70,
  baseColor = '#005293',
  crossColor = '#fecb00',
  innerColor,
  className,
}: {
  width?: number;
  height?: number;
  baseColor?: string;
  crossColor?: string;
  innerColor?: string;
  className?: string;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 110 70" className={className}>
      <rect width="110" height="70" fill={baseColor} rx="4" />
      <rect x="32" y="0" width="18" height="70" fill={crossColor} />
      <rect x="0" y="26" width="110" height="18" fill={crossColor} />
      {innerColor && (
        <>
          <rect x="36" y="0" width="10" height="70" fill={innerColor} />
          <rect x="0" y="30" width="110" height="10" fill={innerColor} />
        </>
      )}
    </svg>
  );
}

/**
 * 13. Jamaican Golden Saltire
 */
export function JamaicaSaltireGraphic({
  width = 110,
  height = 70,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 110 70" className={className}>
      <polygon points="0,0 55,35 0,70" fill="#000000" />
      <polygon points="110,0 55,35 110,70" fill="#000000" />
      <polygon points="0,0 55,35 110,0" fill="#007749" />
      <polygon points="0,70 55,35 110,70" fill="#007749" />
      <line x1="0" y1="0" x2="110" y2="70" stroke="#fed100" strokeWidth="14" />
      <line x1="110" y1="0" x2="0" y2="70" stroke="#fed100" strokeWidth="14" />
    </svg>
  );
}

/**
 * 14. Traditional Maasai Warrior Shield (Kenya)
 */
export function MaasaiShieldGraphic({ size = 80, className }: GraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <line x1="15" y1="85" x2="85" y2="15" stroke="#ffffff" strokeWidth="4" />
      <line x1="85" y1="85" x2="15" y2="15" stroke="#ffffff" strokeWidth="4" />
      <ellipse cx="50" cy="50" rx="22" ry="42" fill="#bb0000" stroke="#000000" strokeWidth="3" />
      <path d="M50 8 Q66 50 50 92 Q34 50 50 8 Z" fill="#000000" />
      <circle cx="50" cy="50" r="7" fill="#ffffff" />
    </svg>
  );
}

/**
 * 15. South Africa Green Y-Pall
 */
export function SouthAfricaPallGraphic({
  width = 110,
  height = 70,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 110 70" className={className}>
      <polygon points="0,0 35,35 0,70" fill="#000000" />
      <polygon points="0,0 42,35 0,70" fill="none" stroke="#ffb81c" strokeWidth="6" />
      <line x1="0" y1="8" x2="38" y2="35" stroke="#007749" strokeWidth="14" />
      <line x1="0" y1="62" x2="38" y2="35" stroke="#007749" strokeWidth="14" />
      <line x1="38" y1="35" x2="110" y2="35" stroke="#007749" strokeWidth="14" />
    </svg>
  );
}

/**
 * 16. Golden Eagle Emblem (Mexico, Egypt)
 */
export function GoldenEagleGraphic({
  size = 80,
  isMexico = false,
  className,
}: {
  size?: number;
  isMexico?: boolean;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path
        d="M50 25 Q30 8 10 24 Q26 40 40 44 L40 70 Q50 78 60 70 L60 44 Q74 40 90 24 Q70 8 50 25 Z"
        fill="#d4af37"
        stroke="#8c6d1f"
        strokeWidth="2"
      />
      <path
        d="M43 42 L57 42 L57 60 Q50 68 43 60 Z"
        fill={isMexico ? '#006847' : '#c8102e'}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <circle cx="50" cy="22" r="8" fill="#d4af37" />
      <polygon points="56,22 66,25 56,28" fill="#f59e0b" />
      <circle cx="52" cy="20" r="1.5" fill="#000000" />
    </svg>
  );
}

/**
 * 17. Flag Stripe Swatch Graphic
 */
export function StripeSwatchGraphic({
  color,
  orientation = 'vertical',
  width = 80,
  height = 70,
  className,
}: {
  color: string;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 70" className={className}>
      <rect width="80" height="70" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="2" rx="8" />
      {orientation === 'vertical' ? (
        <rect x="22" y="4" width="36" height="62" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" rx="4" />
      ) : (
        <rect x="4" y="18" width="72" height="34" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" rx="4" />
      )}
    </svg>
  );
}

/**
 * Helper to render the appropriate rich vector graphic for a puzzle piece or choice
 */
export function renderPieceGraphic(
  pieceKey: string,
  color?: string,
  size = 72
): ReactNode {
  const key = pieceKey.toLowerCase();

  if (key.includes('maple') || key.includes('leaf')) {
    return <MapleLeafGraphic size={size} color={color || '#d80621'} />;
  }
  if (key.includes('circle') || key.includes('sun disc') || key === 'puzzle_japan') {
    return <SunDiscGraphic size={size} color={color || '#bc002d'} />;
  }
  if (key.includes('chakra') || key.includes('wheel')) {
    return <AshokaChakraGraphic size={size} color={color || '#000080'} />;
  }
  if (key.includes('sun of may') || key.includes('may sun') || key.includes('sol de mayo')) {
    return <SunOfMayGraphic size={size} />;
  }
  if (key.includes('50-star') || key.includes('canton with stars') || key === 'puzzle_usa') {
    return <UsCantonGraphic width={Math.round(size * 1.4)} height={size} />;
  }
  if (key.includes('greek cross') || key.includes('cross on blue') || key === 'puzzle_greece') {
    return <GreekCantonGraphic size={size} />;
  }
  if (key.includes('white cross') || key.includes('swiss') || key === 'puzzle_switzerland') {
    return <SwissCrossGraphic size={size} />;
  }
  if (key.includes('union jack') || key === 'puzzle_australia') {
    return <UnionJackGraphic width={Math.round(size * 1.4)} height={size} />;
  }
  if (key.includes('taegeuk') || key.includes('yin-yang') || key === 'puzzle_south_korea') {
    return <TaegeukGraphic size={size} />;
  }
  if (key.includes('globe') || key.includes('celestial') || key === 'puzzle_brazil') {
    return <BrazilGlobeGraphic size={size} />;
  }
  if (key.includes('5 golden stars') || key.includes('stars cluster') || key === 'puzzle_china') {
    return <ChinaStarsGraphic size={size} />;
  }
  if (key.includes('yellow cross') || key.includes('yellow nordic') || key === 'puzzle_sweden') {
    return <NordicCrossGraphic width={Math.round(size * 1.35)} height={size} baseColor="#005293" crossColor="#fecb00" />;
  }
  if (key.includes('blue & white cross') || key === 'puzzle_norway') {
    return <NordicCrossGraphic width={Math.round(size * 1.35)} height={size} baseColor="#ba0c2f" crossColor="#ffffff" innerColor="#00205b" />;
  }
  if (key.includes('saltire') || key === 'puzzle_jamaica') {
    return <JamaicaSaltireGraphic width={Math.round(size * 1.35)} height={size} />;
  }
  if (key.includes('maasai') || key.includes('shield') || key === 'puzzle_kenya') {
    return <MaasaiShieldGraphic size={size} />;
  }
  if (key.includes('y-pall') || key.includes('pall') || key === 'puzzle_south_africa') {
    return <SouthAfricaPallGraphic width={Math.round(size * 1.35)} height={size} />;
  }
  if (key.includes('eagle') || key === 'puzzle_mexico' || key === 'puzzle_egypt') {
    return <GoldenEagleGraphic size={size} isMexico={key.includes('mexico')} />;
  }
  if (key.includes('vertical stripe') || key.includes('stripe') || color) {
    const isHorizontal = key.includes('horizontal') || key.includes('gold stripe') || key.includes('bottom');
    return (
      <StripeSwatchGraphic
        color={color || '#3182ce'}
        orientation={isHorizontal ? 'horizontal' : 'vertical'}
        width={Math.round(size * 1.1)}
        height={size}
      />
    );
  }

  // Fallback visual dot/star
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        backgroundColor: color || '#4299e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: Math.round(size * 0.45),
        fontWeight: 900,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      ★
    </div>
  );
}
