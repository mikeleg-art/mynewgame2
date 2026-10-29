'use client';

import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  children: ReactNode;
  labelledBy?: string;
};

/** Shared candy-card modal with pop-in animation. */
export function Modal({ open, children, labelledBy }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#6B2B54]/45 p-6 backdrop-blur-[3px] bb-modal-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className="w-full max-w-[320px] rounded-[28px] bg-gradient-to-b from-[#FFFFFF] to-[#FFEAF4] p-5 shadow-[0_10px_0_rgba(225,78,126,0.35),0_24px_48px_rgba(107,43,84,0.35)] ring-2 ring-white/80">
        {children}
      </div>
    </div>
  );
}
