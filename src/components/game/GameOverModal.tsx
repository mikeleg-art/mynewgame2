'use client';

import { CrownIcon } from './icons';
import { Modal } from './Modal';
import { sfx } from '@/lib/sound';

type Props = {
  open: boolean;
  score: number;
  best: number;
  isNewBest: boolean;
  onRestart: () => void;
  onMenu: () => void;
};

export function GameOverModal({ open, score, best, isNewBest, onRestart, onMenu }: Props) {
  return (
    <Modal open={open} labelledBy="bb-gameover-title">
      <div className="flex flex-col items-center text-center">
        {isNewBest && (
          <div className="bb-ribbon mb-2 rounded-full bg-gradient-to-r from-[#FF9800] to-[#FFC107] px-4 py-1 text-sm font-bold text-white shadow">
            NEW BEST!
          </div>
        )}
        <h2 id="bb-gameover-title" className="text-2xl font-bold text-[#6B4A2B]">
          Game Over
        </h2>

        <div className="mt-3 w-full rounded-2xl bg-white/70 px-6 py-4">
          <div className="text-xs font-bold uppercase tracking-widest text-[#A98B6A]">Score</div>
          <div className="text-4xl font-bold text-[#5D4037]">{score.toLocaleString('en-US')}</div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <CrownIcon size={20} />
            <span className="text-sm font-bold text-[#B8860B]">Best {best.toLocaleString('en-US')}</span>
          </div>
        </div>

        <div className="mt-5 flex w-full flex-col gap-2.5">
          <button
            type="button"
            className="bb-btn bb-btn-orange w-full"
            onClick={() => {
              sfx.click();
              onRestart();
            }}
          >
            <span>Play Again</span>
          </button>
          <button
            type="button"
            className="w-full rounded-full border-2 border-[#D9B98C] bg-white/80 py-2.5 text-center font-bold text-[#8A6B4A] transition active:scale-95"
            onClick={() => {
              sfx.click();
              onMenu();
            }}
          >
            Main Menu
          </button>
        </div>
      </div>
    </Modal>
  );
}
