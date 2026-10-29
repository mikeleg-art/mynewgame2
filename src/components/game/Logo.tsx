'use client';

/** Chunky candy "BLOCKY POP!" logo — per-letter pastel colors + mascot sidekick. */

const BLOCK_COLORS: Array<{ color: string; shadow: string }> = [
  { color: '#FF6B9D', shadow: '#E14E7E' }, // B
  { color: '#FFA94D', shadow: '#F08A1D' }, // L
  { color: '#FFD43B', shadow: '#F0B400' }, // O
  { color: '#69DB7C', shadow: '#37B24D' }, // C
  { color: '#74C0FC', shadow: '#3B95E8' }, // K
  { color: '#C39BFF', shadow: '#9775FA' }, // Y
];

const POP_COLORS: Array<{ color: string; shadow: string }> = [
  { color: '#74C0FC', shadow: '#3B95E8' }, // P
  { color: '#FF6B9D', shadow: '#E14E7E' }, // O
  { color: '#69DB7C', shadow: '#37B24D' }, // P
  { color: '#FFD43B', shadow: '#F0B400' }, // !
];

function Letter({
  ch,
  i,
  delay,
  palette,
}: {
  ch: string;
  i: number;
  delay: string;
  palette: Array<{ color: string; shadow: string }>;
}) {
  const c = palette[i % palette.length];
  return (
    <span
      className="bb-letter inline-block"
      style={{
        color: c.color,
        textShadow: `0 ${4}px 0 ${c.shadow}, 0 8px 14px rgba(0,0,0,0.25)`,
        animationDelay: delay,
      }}
    >
      {ch}
    </span>
  );
}

export function Logo() {
  return (
    <div className="select-none text-center leading-none" aria-label="Blocky Pop!">
      <div className="relative inline-block">
        <h1
          className="bb-logo-row relative z-0"
          style={{ fontSize: 'clamp(2.6rem, 12.5vw, 3.9rem)', letterSpacing: '0.01em' }}
        >
          {'BLOCKY'.split('').map((ch, i) => (
            <Letter key={i} ch={ch} i={i} palette={BLOCK_COLORS} delay={`${0.1 + i * 0.12}s`} />
          ))}
        </h1>
        {/* crown sits over the O (3rd letter) */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="bb-logo-crown absolute"
          style={{
            width: 'clamp(2rem, 9vw, 2.7rem)',
            top: 'clamp(-1.35rem, -5.6vw, -1rem)',
            left: '50%',
            transform: 'translateX(-58%) rotate(-7deg)',
          }}
        >
          <path
            d="M3 9 7.2 12.2 12 6.4 16.8 12.2 21 9 19.2 16.9c-.15.75-.8 1.4-1.7 1.4H6.5c-.9 0-1.55-.65-1.7-1.4L3 9Z"
            fill="#FFC53D"
            stroke="#E8960C"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <circle cx="3.2" cy="8" r="1.5" fill="#FFE082" stroke="#E8960C" strokeWidth="0.9" />
          <circle cx="12" cy="5.4" r="1.5" fill="#FFE082" stroke="#E8960C" strokeWidth="0.9" />
          <circle cx="20.8" cy="8" r="1.5" fill="#FFE082" stroke="#E8960C" strokeWidth="0.9" />
        </svg>
        {/* sparkle accents */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="bb-logo-spark absolute"
          style={{ width: 'clamp(1rem, 4.5vw, 1.4rem)', top: '-8%', right: '-9%' }}
        >
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" fill="#FFF3B0" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="bb-logo-spark absolute"
          style={{
            width: 'clamp(0.8rem, 3.6vw, 1.1rem)',
            bottom: '-4%',
            left: '-8%',
            animationDelay: '0.7s',
          }}
        >
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" fill="#FFD6EC" />
        </svg>
      </div>
      <div
        className="bb-logo-blast"
        style={{
          fontSize: 'clamp(2.1rem, 10.5vw, 3.1rem)',
          color: '#FFF',
          textShadow:
            '0 3px 0 #E14E7E, 0 0 18px rgba(255,107,157,0.55), 0 7px 12px rgba(0,0,0,0.25)',
        }}
      >
        {'POP!'.split('').map((ch, i) => (
          <Letter key={i} ch={ch} i={i} palette={POP_COLORS} delay={`${0.75 + i * 0.12}s`} />
        ))}
      </div>
      <div
        className="mt-2 font-semibold text-white/90"
        style={{ fontSize: 'clamp(0.72rem, 3.4vw, 0.95rem)', letterSpacing: '0.3em' }}
      >
        POP · MATCH · SPARKLE
      </div>
    </div>
  );
}
