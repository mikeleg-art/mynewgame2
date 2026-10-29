'use client';

/** Chunky 3D "BLOCK BLAST" logo built from per-letter styled spans. */

const BLOCK_COLORS: Array<{ color: string; shadow: string }> = [
  { color: '#FF9800', shadow: '#D96E00' }, // B
  { color: '#2196F3', shadow: '#1565C0' }, // L
  { color: '#F44336', shadow: '#B71C1C' }, // O
  { color: '#FFC107', shadow: '#C79100' }, // C
  { color: '#AB47BC', shadow: '#7B1FA2' }, // K
];

function Letter({ ch, i, delay }: { ch: string; i: number; delay: string }) {
  const c = BLOCK_COLORS[i];
  return (
    <span
      className="bb-letter inline-block"
      style={{
        color: c.color,
        textShadow: `0 ${4}px 0 ${c.shadow}, 0 8px 14px rgba(0,0,0,0.35)`,
        animationDelay: delay,
      }}
    >
      {ch}
    </span>
  );
}

export function Logo() {
  return (
    <div className="select-none text-center leading-none" aria-label="Block Blast">
      <div className="relative inline-block">
        <h1
          className="bb-logo-row relative z-0"
          style={{ fontSize: 'clamp(3rem, 15vw, 4.4rem)', letterSpacing: '0.01em' }}
        >
          {'BLOCK'.split('').map((ch, i) => (
            <Letter key={i} ch={ch} i={i} delay={`${0.1 + i * 0.12}s`} />
          ))}
        </h1>
        {/* crown sits on the red O (3rd letter) */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="bb-logo-crown absolute"
          style={{
            width: 'clamp(2.2rem, 10vw, 3rem)',
            top: 'clamp(-1.4rem, -6vw, -1.1rem)',
            left: '50%',
            transform: 'translateX(-52%) rotate(-6deg)',
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
      </div>
      <div
        className="bb-logo-blast"
        style={{
          fontSize: 'clamp(2.2rem, 11vw, 3.2rem)',
          color: '#53D2FF',
          textShadow: '0 3px 0 #1877C9, 0 7px 12px rgba(0,0,0,0.35)',
        }}
      >
        BLAST
      </div>
      <div
        className="mt-1 font-semibold text-[#BEE3FF]"
        style={{ fontSize: 'clamp(0.72rem, 3.4vw, 0.95rem)', letterSpacing: '0.32em' }}
      >
        ADVENTURE MASTER
      </div>
    </div>
  );
}
