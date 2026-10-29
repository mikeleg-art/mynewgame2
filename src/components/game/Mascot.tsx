'use client';

/**
 * "Blocky" — the cute crystal cluster mascot of Blocky Pop!
 * Pure SVG, no faces — just sparkling gems with three vibes:
 * happy (bright), wow (crowned, extra sparkles), sad (dimmed + cracked).
 */

export type Mood = 'happy' | 'wow' | 'sad';

function Cluster({ bright }: { bright: boolean }) {
  // gem fills swap to dim lavender-grays when not bright
  const big = bright ? 'url(#mascot-body)' : 'url(#mascot-dim)';
  const side = bright ? 'url(#mascot-side)' : 'url(#mascot-dim-side)';
  return (
    <>
      {/* left baby gem */}
      <g transform="translate(16 62) rotate(-14) scale(0.42)">
        <GemShape fill={side} stroke="#B25A8E" />
        <FacetLight opacity={bright ? 0.5 : 0.3} />
      </g>
      {/* right baby gem */}
      <g transform="translate(84 58) rotate(15) scale(0.38)">
        <GemShape fill={side} stroke="#B25A8E" />
        <FacetLight opacity={bright ? 0.5 : 0.3} />
      </g>
      {/* big hero gem */}
      <g transform="translate(50 54)">
        <GemShape fill={big} stroke="#E14E8C" />
        <FacetLight opacity={bright ? 0.62 : 0.34} />
        {!bright && (
          <path
            d="M-4 -26 -1 -10 -8 -2 -4 8"
            stroke="#5E4A78"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        )}
      </g>
      {/* ground shadow */}
      <ellipse cx="50" cy="88" rx="26" ry="5" fill="#5A2545" opacity="0.18" />
    </>
  );
}

function GemShape({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <path
      d="M0 -34c4 0 7.6 2 10 5.2l12 13.8c4 4.4 4 11.6 0 16L10 14.8C7 18.4 3.6 20 0 20s-7-1.6-10-5.2l-12-13.8c-4-4.4-4-11.6 0-16l12-13.8C-7.6-32-4-34 0-34Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="3.4"
      strokeLinejoin="round"
      transform="scale(1.05)"
    />
  );
}

function FacetLight({ opacity }: { opacity: number }) {
  return (
    <>
      {/* top facet */}
      <path d="M0 -26 14 -2h-28L0 -26Z" fill="#ffffff" opacity={opacity} transform="scale(1.05)" />
      {/* right pavilion shade */}
      <path d="M0 -2h14L0 16.5 0 -2Z" fill="#000000" opacity="0.1" transform="scale(1.05)" />
    </>
  );
}

function Sparkle({ x, y, s, delay = 0 }: { x: number; y: number; s: number; delay?: number }) {
  return (
    <path
      d={`M${x} ${y - s}l${s * 0.26} ${s * 0.74} ${s * 0.74} ${s * 0.26} -${s * 0.74} ${s * 0.26} -${s * 0.26} ${s * 0.74} -${s * 0.26} -${s * 0.74} -${s * 0.74} -${s * 0.26} ${s * 0.74} -${s * 0.26} ${s * 0.26} -${s * 0.74}Z`}
      fill="#FFFDF4"
      opacity="0.95"
      className="bb-twinkle"
      style={{ animationDelay: `${delay}s`, transformOrigin: `${x}px ${y}px` }}
    />
  );
}

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
  const bright = mood !== 'sad';
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
          <stop offset="0" stopColor="#FFA5D0" />
          <stop offset="1" stopColor="#FF6BA9" />
        </linearGradient>
        <linearGradient id="mascot-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC0DE" />
          <stop offset="1" stopColor="#FF8FC0" />
        </linearGradient>
        <linearGradient id="mascot-dim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B3A6CC" />
          <stop offset="1" stopColor="#8D7BAE" />
        </linearGradient>
        <linearGradient id="mascot-dim-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9BDDC" />
          <stop offset="1" stopColor="#A795C2" />
        </linearGradient>
      </defs>

      {crown && (
        <g transform="translate(50 -7) rotate(-8)">
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

      <Cluster bright={bright} />

      {/* sparkles — extra twinkly when the crystal feels proud */}
      <Sparkle x={14} y={26} s={mood === 'wow' ? 6 : 4.6} />
      <Sparkle x={86} y={22} s={mood === 'wow' ? 5.4 : 4} delay={0.9} />
      {mood === 'wow' && <Sparkle x={76} y={80} s={4.4} delay={1.6} />}

      {/* one sad droplet rolling off the cracked gem */}
      {mood === 'sad' && (
        <path
          d="M78 66c0 0 3.4 4.6 3.4 6.6a3.4 3.4 0 1 1-6.8 0C74.6 70.6 78 66 78 66Z"
          fill="#7CC0FF"
        />
      )}
    </svg>
  );
}
