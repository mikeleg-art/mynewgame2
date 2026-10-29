'use client';

import { useCallback, useEffect, useState } from 'react';
import { MenuScreen } from './MenuScreen';
import { GameScreen } from './GameScreen';
import { Modal } from './Modal';
import { sfx } from '@/lib/sound';
import { cloudGet, cloudSet, initTelegram } from '@/lib/telegram';
import {
  bumpStreak,
  loadBest,
  loadSettings,
  loadStreak,
  saveBest,
  saveSettings,
  type Settings,
} from '@/lib/game/storage';

type Screen = 'menu' | 'game';
type Mode = 'classic' | 'adventure';

export function BlockBlast() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<Mode>('classic');
  const [best, setBest] = useState(0);
  const [daily, setDaily] = useState(0);
  const [settings, setSettings] = useState<Settings>({ sound: true, haptics: true });
  const [moreOpen, setMoreOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Boot: Telegram + persisted state (async so we never setState synchronously in an effect).
  useEffect(() => {
    initTelegram();
    let cancelled = false;
    void (async () => {
      const cloudRaw = await cloudGet('bb_best');
      if (cancelled) return;
      const local = loadSettings();
      const localBest = loadBest();
      const cloudBest = cloudRaw ? parseInt(cloudRaw, 10) || 0 : 0;
      const merged = Math.max(localBest, cloudBest);
      sfx.enabled = local.sound;
      setSettings(local);
      setBest(merged);
      if (merged > localBest) saveBest(merged);
      setDaily(loadStreak().count);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Block pinch/double-tap zoom + pull-to-refresh inside Telegram WebView.
    document.addEventListener('gesturestart', prevent);
    document.addEventListener('dblclick', prevent);
    return () => {
      document.removeEventListener('gesturestart', prevent);
      document.removeEventListener('dblclick', prevent);
    };
  }, []);

  const updateSettings = useCallback((next: Settings) => {
    setSettings(next);
    sfx.enabled = next.sound;
    saveSettings(next);
  }, []);

  const handleNewBest = useCallback((b: number) => {
    setBest((cur) => {
      if (b > cur) {
        saveBest(b);
        cloudSet('bb_best', String(b));
        return b;
      }
      return cur;
    });
  }, []);

  const handleFinish = useCallback(() => {
    setDaily(bumpStreak().count);
  }, []);

  const startGame = useCallback((m: Mode) => {
    sfx.unlock();
    sfx.click();
    setMode(m);
    setScreen('game');
  }, []);

  const exitToMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  if (!ready) {
    // brief splash to avoid hydration flicker while storage loads
    return <div className="bb-bg-blue h-dvh w-full" />;
  }

  return (
    <div
      className={`h-dvh w-full overflow-hidden ${screen === 'menu' ? 'bb-bg-blue' : 'bb-bg-brown'}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {screen === 'menu' ? (
        <MenuScreen
          dailyCount={daily}
          best={best}
          onAdventure={() => startGame('adventure')}
          onClassic={() => startGame('classic')}
          onMoreGames={() => {
            sfx.click();
            setMoreOpen(true);
          }}
        />
      ) : (
        <GameScreen
          key={mode + String(screen === 'game')}
          mode={mode}
          best={best}
          sound={settings.sound}
          haptics={settings.haptics}
          onExit={exitToMenu}
          onFinish={handleFinish}
          onNewBest={handleNewBest}
          onToggleSound={() => updateSettings({ ...settings, sound: !settings.sound })}
          onToggleHaptics={() => updateSettings({ ...settings, haptics: !settings.haptics })}
        />
      )}

      <Modal open={moreOpen} labelledBy="bb-more-title">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 id="bb-more-title" className="text-xl font-bold text-[#6B4A2B]">
            More Games
          </h2>
          <p className="text-sm font-medium leading-relaxed text-[#8A6B4A]">
            A whole arcade of puzzles and adventures is on the way. Follow our channel to be the first to
            play the next hit!
          </p>
          <div className="grid w-full grid-cols-3 gap-2 py-1">
            {['Puzzle', 'Racing', 'Merge'].map((g) => (
              <div key={g} className="rounded-xl bg-white/70 py-3 text-xs font-bold text-[#A98B6A]">
                {g}
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#C9B08D]">
                  Soon
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="bb-btn bb-btn-green w-full"
            onClick={() => {
              sfx.click();
              setMoreOpen(false);
            }}
          >
            <span>Got it</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}

function prevent(e: Event): void {
  e.preventDefault();
}
