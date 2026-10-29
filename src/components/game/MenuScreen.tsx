'use client';

import { AlarmClock, Gamepad2, Infinity as InfinityIcon } from 'lucide-react';
import { Logo } from './Logo';
import { Mascot } from './Mascot';
import { GemIcon, MedalIcon, WinBadge } from './icons';

type Props = {
  dailyCount: number;
  best: number;
  onAdventure: () => void;
  onClassic: () => void;
  onMoreGames: () => void;
};

export function MenuScreen({ dailyCount, best, onAdventure, onClassic, onMoreGames }: Props) {
  return (
    <div className="relative flex h-full w-full flex-col items-center px-6 pb-8 pt-4">
      {/* Medal — top right */}
      <div className="absolute right-4 top-3 flex flex-col items-center" aria-hidden="true">
        <MedalIcon size={40} />
        <span className="text-sm font-bold text-white drop-shadow">Medal</span>
      </div>

      {/* Mascot peeking — top left */}
      <div className="absolute left-3 top-2" aria-hidden="true">
        <Mascot size={64} mood="happy" className="bb-mascot-bob" />
      </div>

      <div className="mt-[5vh] flex w-full flex-1 flex-col items-center justify-start">
        <Logo />
      </div>

      {/* Daily victories card */}
      <div className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-[0_6px_0_rgba(225,78,126,0.30),0_12px_24px_rgba(107,43,84,0.22)] ring-2 ring-white">
        <div className="flex items-center justify-center gap-1.5 bg-[#FF8CC8]/95 py-1.5 text-center text-[15px] font-bold text-white drop-shadow-sm">
          <GemIcon size={15} color="#FFE0F0" />
          <span>Consecutive Daily Victories</span>
          <GemIcon size={15} color="#FFE0F0" />
        </div>
        <div className="flex items-center justify-center gap-4 px-6 py-3.5">
          <WinBadge size={54} />
          <span className="text-3xl font-bold text-[#8C3A68]">
            <span className="text-2xl align-middle">×</span>
            {dailyCount}
          </span>
        </div>
      </div>

      {/* Best score hint */}
      <div className="mt-3 flex items-center gap-1.5 text-white/95" aria-label={`Best score ${best}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M3 8.5 7.2 12 12 5.5 16.8 12 21 8.5 19.2 17.5c-.15.8-.8 1.5-1.7 1.5H6.5c-.9 0-1.55-.7-1.7-1.5L3 8.5Z"
            fill="#FFC53D"
            stroke="#E8960C"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-semibold drop-shadow">Best: {best.toLocaleString('en-US')}</span>
      </div>

      {/* Action buttons */}
      <div className="mt-auto flex w-full max-w-[340px] flex-col gap-3.5 pt-6">
        <button type="button" onClick={onAdventure} className="bb-btn bb-btn-peach">
          <AlarmClock size={24} strokeWidth={2.6} aria-hidden="true" />
          <span>Adventure</span>
        </button>
        <button type="button" onClick={onClassic} className="bb-btn bb-btn-mint">
          <InfinityIcon size={28} strokeWidth={2.8} aria-hidden="true" />
          <span>Classic</span>
        </button>
        <button type="button" onClick={onMoreGames} className="bb-btn bb-btn-sky">
          <Gamepad2 size={24} strokeWidth={2.6} aria-hidden="true" />
          <span>More Games</span>
        </button>
      </div>
    </div>
  );
}
