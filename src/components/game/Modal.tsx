'use client';

import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  children: ReactNode;
  labelledBy?: string;
};

/** Shared cream-card modal with pop-in animation. */
export function Modal({ open, children, labelledBy }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-6 backdrop-blur-[2px] bb-modal-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className="w-full max-w-[320px] rounded-3xl bg-gradient-to-b from-[#FFF9EC] to-[#FFE9C6] p-5 shadow-[0_10px_0_rgba(0,0,0,0.18),0_24px_48px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </div>
  );
}
