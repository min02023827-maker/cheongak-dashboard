'use client';

const REGION_HUE: Record<string, number> = {
  서울: 220, 경기: 200, 인천: 190, 부산: 205,
  대구: 25, 세종: 160, 광주: 175, 대전: 185,
  울산: 30, 강원: 150, 충북: 165, 충남: 170,
  전북: 140, 전남: 135, 경북: 35, 경남: 155, 제주: 195,
};

function regionHue(region: string) {
  for (const [k, v] of Object.entries(REGION_HUE)) {
    if (region?.includes(k)) return v;
  }
  return 220;
}

export function regionBg(region: string) {
  const hue = regionHue(region);
  return `linear-gradient(135deg, oklch(0.82 0.1 ${hue}), oklch(0.66 0.16 ${hue}))`;
}

interface HouseGlyphProps {
  region: string;
  style?: React.CSSProperties;
  bare?: boolean;
}

export default function HouseGlyph({ region, style, bare = false }: HouseGlyphProps) {
  const hue = regionHue(region);

  const buildings = (fill: string, op: number) => (
    <g fill={fill} opacity={op}>
      <rect x="22" y="46" width="22" height="58" rx="2" />
      <rect x="50" y="30" width="24" height="74" rx="2" />
      <rect x="80" y="54" width="20" height="50" rx="2" />
    </g>
  );
  const windows = (fill: string, op: number) => (
    <g fill={fill} opacity={op}>
      <rect x="55" y="38" width="5" height="6" /><rect x="64" y="38" width="5" height="6" />
      <rect x="55" y="50" width="5" height="6" /><rect x="64" y="50" width="5" height="6" />
      <rect x="55" y="62" width="5" height="6" /><rect x="64" y="62" width="5" height="6" />
      <rect x="28" y="54" width="4" height="5" /><rect x="35" y="54" width="4" height="5" />
      <rect x="28" y="66" width="4" height="5" /><rect x="35" y="66" width="4" height="5" />
    </g>
  );

  if (bare) {
    return (
      <svg viewBox="20 26 84 82" preserveAspectRatio="xMidYMax meet" style={style} aria-hidden>
        {buildings('rgba(255,255,255,0.95)', 1)}
        {windows(`oklch(0.6 0.16 ${hue})`, 0.55)}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" style={style} aria-hidden>
      <defs>
        <linearGradient id={`g${hue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`oklch(0.72 0.12 ${hue})`} />
          <stop offset="1" stopColor={`oklch(0.55 0.15 ${hue})`} />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill={`oklch(0.94 0.03 ${hue})`} />
      {buildings(`url(#g${hue})`, 0.92)}
      {windows(`oklch(0.99 0.01 ${hue})`, 0.85)}
    </svg>
  );
}
