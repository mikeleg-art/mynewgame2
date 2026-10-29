'use client';

import { CrownIcon } from './icons';
import { Mascot } from './Mascot';
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
        {isNewBest ? (
          <>
            <div className="bb-ribbon mb-1 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFC53D] px-4 py-1 text-sm font-bold text-white shadow">
              ✦ NEW BEST! ✦
            </div>
            <Mascot size={92} mood="wow" crown className="bb-mascot-bounce" />
          </>
        ) : (
          <Mascot size={92} mood="sad" className="bb-mascot-wobble" />
        )}

        <h2 id="bb-gameover-title" className="mt-1 text-2xl font-bold text-[#E14E7E]">
          {isNewBest ? 'Squeee!' : 'Oh no!'}
        </h2>
        <p className="text-xs font-semibold text-[#B96B95]">
          {isNewBest ? 'You popped like a star!' : 'No moves left — the blocks got comfy.'}
        </p>

        <div className="mt-3 w-full rounded-2xl bg-white/85 px-6 py-4 ring-2 ring-[#FFD6EC]">
          <div className="text-xs font-bold uppercase tracking-widest text-[#C77BAA]">Score</div>
          <div className="text-4xl font-bold text-[#8C3A68]">{score.toLocaleString('en-US')}</div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <CrownIcon size={20} />
            <span className="text-sm font-bold text-[#E8960C]">Best {best.toLocaleString('en-US')}</span>
          </div>
        </div>

        <div className="mt-5 flex w-full flex-col gap-2.5">
          <button
            type="button"
            className="bb-btn bb-btn-pink w-full"
            onClick={() => {
              sfx.click();
              onRestart();
            }}
          >
            <span>Play Again</span>
          </button>
          <button
            type="button"
            className="w-full rounded-full border-2 border-[#FFD6EC] bg-white/80 py-2.5 text-center font-bold text-[#C9639A] transition active:scale-95"
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
