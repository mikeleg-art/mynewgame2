'use client';

import { Volume2, VolumeX, RotateCcw, Home, X, Vibrate } from 'lucide-react';
import { Modal } from './Modal';
import { sfx } from '@/lib/sound';

type Props = {
  open: boolean;
  sound: boolean;
  haptics: boolean;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onClose: () => void;
};

function ToggleRow({
  icon,
  label,
  on,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-2xl bg-white/70 px-4 py-3 transition active:scale-[0.98]"
      aria-pressed={on}
    >
      <span className="flex items-center gap-2 font-bold text-[#6B4A2B]">
        {icon}
        {label}
      </span>
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-[#43D96B]' : 'bg-[#C9BBA8]'}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            on ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

export function SettingsModal({
  open,
  sound,
  haptics,
  onToggleSound,
  onToggleHaptics,
  onRestart,
  onMenu,
  onClose,
}: Props) {
  return (
    <Modal open={open} labelledBy="bb-settings-title">
      <div className="relative flex flex-col gap-2.5">
        <button
          type="button"
          aria-label="Close settings"
          onClick={() => {
            sfx.click();
            onClose();
          }}
          className="absolute -right-1 -top-1 rounded-full bg-[#EAD9BE] p-1.5 text-[#8A6B4A] transition active:scale-90"
        >
          <X size={18} />
        </button>
        <h2 id="bb-settings-title" className="mb-1 text-center text-xl font-bold text-[#6B4A2B]">
          Settings
        </h2>

        <ToggleRow
          icon={<Volume2 size={18} aria-hidden="true" />}
          label="Sound"
          on={sound}
          onToggle={() => {
            sfx.click();
            onToggleSound();
          }}
        />
        <ToggleRow
          icon={<Vibrate size={18} aria-hidden="true" />}
          label="Vibration"
          on={haptics}
          onToggle={() => {
            sfx.click();
            onToggleHaptics();
          }}
        />

        <div className="mt-2 flex flex-col gap-2.5">
          <button
            type="button"
            className="bb-btn bb-btn-orange w-full"
            onClick={() => {
              sfx.click();
              onRestart();
            }}
          >
            <RotateCcw size={20} strokeWidth={2.6} aria-hidden="true" />
            <span>Restart</span>
          </button>
          <button
            type="button"
            className="bb-btn bb-btn-sky w-full"
            onClick={() => {
              sfx.click();
              onMenu();
            }}
          >
            <Home size={20} strokeWidth={2.6} aria-hidden="true" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
