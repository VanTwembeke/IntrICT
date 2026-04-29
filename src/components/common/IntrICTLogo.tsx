/**
 * IntrICTLogo — shared brand logo component
 *
 * Renders the IntrICT icon mark + wordmark as an inline SVG, without any
 * background rectangle, so it integrates cleanly into any surface.
 *
 * variant='dark'  → white elements — for dark/coloured backgrounds (footer, dark header)
 * variant='light' → dark elements  — for white/light backgrounds (sidebar, cards, scrolled header)
 *
 * Colours are taken directly from the official brand assets (badge_dark_v2 / badge_light_v2).
 */

interface IntrICTLogoProps {
  /** Colour scheme: 'dark' = white on dark bg, 'light' = dark on light bg */
  variant: 'dark' | 'light';
  /** Tailwind / CSS class — defaults to h-9 w-auto */
  className?: string;
}

export default function IntrICTLogo({ variant, className }: IntrICTLogoProps) {
  const fill   = variant === 'dark' ? '#ffffff' : '#2B2F43';
  const accent = variant === 'dark' ? 'rgba(255,255,255,0.5)' : '#8891A8';

  return (
    <svg
      viewBox="24 22 450 135"
      className={className ?? 'h-9 w-auto'}
      aria-label="IntrICT"
      role="img"
    >
      {/* i — dot */}
      <circle cx="44" cy="52" r="17" fill={fill} />
      {/* i — stem */}
      <rect x="35" y="75" width="19" height="80" rx="10" fill={fill} />
      {/* C — top & bottom dots */}
      <circle cx="84" cy="69" r="10" fill={fill} />
      <circle cx="84" cy="111" r="10" fill={fill} />
      {/* / — diagonal bar */}
      <line x1="132" y1="28" x2="116" y2="152" stroke={fill} strokeWidth="18" strokeLinecap="round" />
      {/* > — chevron bracket */}
      <path d="M 162 25 L 214 90 L 162 155" fill="none" stroke={accent} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      {/* divider */}
      <line x1="253" y1="40" x2="253" y2="140" stroke={fill} strokeWidth="1" opacity="0.2" />
      {/* wordmark */}
      <text
        x="284" y="108"
        fontFamily="'SF Pro Display','Segoe UI',Helvetica,Arial,sans-serif"
        fontSize="52"
        fontWeight="700"
        fill={fill}
        letterSpacing="-1"
      >
        IntrICT
      </text>
    </svg>
  );
}
