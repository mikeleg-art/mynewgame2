/** Small inline SVG icons matching the Block Blast art style. */

export function CrownIcon({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3 8.5 7.2 12 12 5.5 16.8 12 21 8.5 19.2 17.5c-.15.8-.8 1.5-1.7 1.5H6.5c-.9 0-1.55-.7-1.7-1.5L3 8.5Z"
        fill="#FFC53D"
        stroke="#E8960C"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="3.2" cy="7.6" r="1.6" fill="#FFE082" stroke="#E8960C" strokeWidth="0.9" />
      <circle cx="12" cy="4.6" r="1.6" fill="#FFE082" stroke="#E8960C" strokeWidth="0.9" />
      <circle cx="20.8" cy="7.6" r="1.6" fill="#FFE082" stroke="#E8960C" strokeWidth="0.9" />
      <rect x="6" y="18.4" width="12" height="2.2" rx="1.1" fill="#E8960C" />
    </svg>
  );
}

export function MedalIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* ribbon */}
      <path d="M17 4h7l-4 14h-7L17 4Z" fill="#E53935" />
      <path d="M31 4h-7l4 14h7L31 4Z" fill="#C62828" />
      <path d="M20.5 4H24l-2 10h-3.5L20.5 4Z" fill="#FF7043" />
      {/* medal disc */}
      <circle cx="24" cy="31" r="12" fill="#FFC53D" stroke="#E8960C" strokeWidth="2" />
      <circle cx="24" cy="31" r="8.6" fill="#FFE082" stroke="#F5A623" strokeWidth="1.2" />
      {/* star */}
      <path
        d="M24 25.4l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6 1.9-3.9Z"
        fill="#F5A623"
        stroke="#E8960C"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/** Crown + WIN badge used on the daily card. */
export function WinBadge({ size = 52 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#5C8DFF] to-[#2B5BD7] border-2 border-white/70 shadow-inner" />
      <div className="absolute inset-0 flex items-start justify-center pt-[22%]">
        <CrownIcon size={size * 0.5} />
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-sm bg-gradient-to-b from-[#43D96B] to-[#1FA050] px-1.5 py-[1px] text-[10px] font-bold text-white tracking-wide shadow" style={{ fontFamily: 'inherit' }}>
        WIN
      </div>
    </div>
  );
}

/** Gear / settings icon. */
export function GearIcon({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm9 5.1v-3l-2.4-.5a6.9 6.9 0 0 0-.7-1.7l1.4-2-2.2-2.2-2 1.4a6.9 6.9 0 0 0-1.7-.7L12.9 3h-3l-.5 2.4a6.9 6.9 0 0 0-1.7.7l-2-1.4-2.2 2.2 1.4 2a6.9 6.9 0 0 0-.7 1.7L1.8 10.5v3l2.4.5c.16.6.4 1.17.7 1.7l-1.4 2 2.2 2.2 2-1.4c.53.3 1.1.54 1.7.7l.5 2.4h3l.5-2.4a6.9 6.9 0 0 0 1.7-.7l2 1.4 2.2-2.2-1.4-2c.3-.53.54-1.1.7-1.7l2.4-.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Diamond gem behind the score. */
export function DiamondIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g transform="rotate(45 20 20)">
        <rect x="6" y="6" width="28" height="28" rx="7" fill="url(#dg)" />
        <rect x="9.5" y="9.5" width="21" height="21" rx="5.5" fill="#6FB1FF" opacity="0.55" />
      </g>
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4C8DFF" />
          <stop offset="1" stopColor="#2B62E0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
