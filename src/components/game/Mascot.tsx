'use client';

/**
 * "Blocky" — the kawaii cube mascot of Blocky Pop!
 * Pure SVG, three expressions: happy / wow / sad.
 */

export type Mood = 'happy' | 'wow' | 'sad';

export function Mascot({
  size = 96,
  mood = 'happy',
  crown = false,
  className = '',
}: {
  size?: number;
  mood?: Mood;
  crown?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="mascot-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF9ECB" />
          <stop offset="1" stopColor="#FF6BA9" />
        </linearGradient>
      </defs>

      {crown && (
        <g transform="translate(50 -6) rotate(-8)">
          <path
            d="M-16 8 -9 12 0 2 9 12 16 8 13 18c-.5 2.4-2.4 4-5 4h-16c-2.6 0-4.5-1.6-5-4Z"
            fill="#FFC53D"
            stroke="#E8960C"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="-16" cy="6" r="2.6" fill="#FFE082" stroke="#E8960C" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="2.8" fill="#FFE082" stroke="#E8960C" strokeWidth="1.4" />
          <circle cx="16" cy="6" r="2.6" fill="#FFE082" stroke="#E8960C" strokeWidth="1.4" />
        </g>
      )}

      {/* body — soft rounded cube */}
      <rect x="12" y="14" width="76" height="76" rx="22" fill="url(#mascot-body)" />
      <rect x="12" y="14" width="76" height="76" rx="22" fill="none" stroke="#E14E8C" strokeWidth="3" />
      {/* glossy top */}
      <rect x="20" y="20" width="60" height="18" rx="9" fill="#FFFFFF" opacity="0.35" />
      {/* blush */}
      <ellipse cx="28" cy="56" rx="8" ry="5" fill="#FF4F94" opacity="0.45" />
      <ellipse cx="72" cy="56" rx="8" ry="5" fill="#FF4F94" opacity="0.45" />

      {mood === 'happy' && (
        <>
          <circle cx="38" cy="46" r="4.6" fill="#4A2540" />
          <circle cx="62" cy="46" r="4.6" fill="#4A2540" />
          <circle cx="39.6" cy="44.4" r="1.5" fill="#fff" />
          <circle cx="63.6" cy="44.4" r="1.5" fill="#fff" />
          <path
            d="M42 58c2.6 3.4 13.4 3.4 16 0"
            stroke="#4A2540"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {mood === 'wow' && (
        <>
          {/* star eyes */}
          <path d="M38 39l2.3 4.7 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.7Z" fill="#4A2540" />
          <path d="M62 39l2.3 4.7 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.7Z" fill="#4A2540" />
          <ellipse cx="50" cy="60" rx="5.4" ry="6.2" fill="#4A2540" />
          <ellipse cx="50" cy="62.4" rx="2.8" ry="2.6" fill="#FF8FB8" />
        </>
      )}

      {mood === 'sad' && (
        <>
          <path
            d="M33 44c2-3 8-3 10 0"
            stroke="#4A2540"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M57 44c2-3 8-3 10 0"
            stroke="#4A2540"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M43 62c2.4-3 11.6-3 14 0"
            stroke="#4A2540"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
          {/* teardrop */}
          <path d="M34 52c0 0 3.4 4.6 3.4 6.6a3.4 3.4 0 1 1-6.8 0C30.6 56.6 34 52 34 52Z" fill="#7CC0FF" />
        </>
      )}
    </svg>
  );
}
