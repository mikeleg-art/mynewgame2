'use client';

import { useCallback, useEffect, useState } from 'react';
import { MenuScreen } from './MenuScreen';
import { GameScreen } from './GameScreen';
import { Modal } from './Modal';
import { sfx } from '@/lib/sound';
import { cloudGet, cloudSet, initTelegram, setTgColor } from '@/lib/telegram';
import {
  bumpStreak,
  loadBest,
  loadSettings,
  loadStreak,
  loadThemeIdx,
  saveBest,
  saveSettings,
  saveThemeIdx,
  type Settings,
} from '@/lib/game/storage';
import { THEMES, nextTheme, themeBg } from '@/lib/game/themes';

type Screen = 'menu' | 'game';
type Mode = 'classic' | 'adventure';

/** Soft white decorations drifting over the pastel sky. */
function Decor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* clouds */}
      <svg className="bb-drift-a absolute left-[4%] top-[7%] w-24 text-white/60" viewBox="0 0 64 32">
        <path
          d="M10 26c-5 0-8-3.4-8-7.6 0-4 3-7 6.8-7.2C10.2 6.6 14.4 3 19.6 3c5.6 0 10 3.8 11.2 8.8 1-.5 2.2-.8 3.4-.8 4.2 0 7.6 3.2 7.8 7.2v.2c2.6.6 4.4 2.6 4.4 5 0 3-2.6 5.4-5.8 5.4H10Z"
          fill="currentColor"
        />
      </svg>
      <svg className="bb-drift-b absolute right-[6%] top-[30%] w-16 text-white/45" viewBox="0 0 64 32">
        <path
          d="M10 26c-5 0-8-3.4-8-7.6 0-4 3-7 6.8-7.2C10.2 6.6 14.4 3 19.6 3c5.6 0 10 3.8 11.2 8.8 1-.5 2.2-.8 3.4-.8 4.2 0 7.6 3.2 7.8 7.2v.2c2.6.6 4.4 2.6 4.4 5 0 3-2.6 5.4-5.8 5.4H10Z"
          fill="currentColor"
        />
      </svg>
      <svg className="bb-drift-b absolute bottom-[24%] left-[7%] w-14 text-white/40" viewBox="0 0 64 32">
        <path
          d="M10 26c-5 0-8-3.4-8-7.6 0-4 3-7 6.8-7.2C10.2 6.6 14.4 3 19.6 3c5.6 0 10 3.8 11.2 8.8 1-.5 2.2-.8 3.4-.8 4.2 0 7.6 3.2 7.8 7.2v.2c2.6.6 4.4 2.6 4.4 5 0 3-2.6 5.4-5.8 5.4H10Z"
          fill="currentColor"
        />
      </svg>
      {/* hearts */}
      <svg className="bb-float-slow absolute right-[10%] bottom-[12%] w-8 text-white/55" viewBox="0 0 24 24">
        <path
          d="M12 21c-6-4.6-9-8-9-11.4C3 6.6 5.2 4.5 8 4.5c1.7 0 3.2.9 4 2.2.8-1.3 2.3-2.2 4-2.2 2.8 0 5 2.1 5 5.1C21 13 18 16.4 12 21Z"
          fill="currentColor"
        />
      </svg>
      <svg className="bb-float-slow absolute left-[13%] top-[38%] w-6 text-white/50" viewBox="0 0 24 24" style={{ animationDelay: '1.6s' }}>
        <path
          d="M12 21c-6-4.6-9-8-9-11.4C3 6.6 5.2 4.5 8 4.5c1.7 0 3.2.9 4 2.2.8-1.3 2.3-2.2 4-2.2 2.8 0 5 2.1 5 5.1C21 13 18 16.4 12 21Z"
          fill="currentColor"
        />
      </svg>
      {/* stars */}
      <svg className="bb-twinkle absolute right-[16%] top-[8%] w-7 text-white/70" viewBox="0 0 24 24">
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" fill="currentColor" />
      </svg>
      <svg className="bb-twinkle absolute left-[24%] bottom-[8%] w-5 text-white/60" viewBox="0 0 24 24" style={{ animationDelay: '1.1s' }}>
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" fill="currentColor" />
      </svg>
      <svg className="bb-twinkle absolute right-[30%] bottom-[30%] w-4 text-white/50" viewBox="0 0 24 24" style={{ animationDelay: '2s' }}>
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" fill="currentColor" />
      </svg>
    </div>
  );
}

export function BlockBlast() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<Mode>('classic');
  const [best, setBest] = useState(0);
  const [daily, setDaily] = useState(0);
  const [settings, setSettings] = useState<Settings>({ sound: true, haptics: true });
  const [moreOpen, setMoreOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);

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
      setThemeIdx(loadThemeIdx());
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

  // Telegram chrome follows the cute theme.
  useEffect(() => {
    if (ready) setTgColor(THEMES[themeIdx].header);
  }, [themeIdx, ready]);

  // On the menu, drift through the pastel worlds all by itself.
  useEffect(() => {
    if (screen !== 'menu') return;
    const t = window.setInterval(() => {
      setThemeIdx((cur) => {
        const n = nextTheme(cur);
        saveThemeIdx(n);
        return n;
      });
    }, 8000);
    return () => window.clearInterval(t);
  }, [screen]);

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

  const handleThemeNext = useCallback(() => {
    setThemeIdx((cur) => {
      const n = nextTheme(cur);
      saveThemeIdx(n);
      return n;
    });
  }, []);

  const startGame = useCallback((m: Mode) => {
    sfx.unlock();
    sfx.click();
    setMode(m);
    // start each run in a random pastel world
    setThemeIdx(() => {
      const n = Math.floor(Math.random() * THEMES.length);
      saveThemeIdx(n);
      return n;
    });
    setScreen('game');
  }, []);

  const exitToMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  const theme = THEMES[themeIdx];

  if (!ready) {
    // brief splash to avoid hydration flicker while storage loads
    return <div className="h-dvh w-full" style={{ background: themeBg(THEMES[0]) }} />;
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      {/* crossfading pastel worlds */}
      <div className="absolute inset-0" aria-hidden="true">
        {THEMES.map((t, i) => (
          <div
            key={t.name}
            className="absolute inset-0 transition-opacity duration-[900ms] ease-in-out"
            style={{ background: themeBg(t), opacity: i === themeIdx ? 1 : 0 }}
          />
        ))}
      </div>

      <Decor />

      <div
        className="relative z-10 h-full"
        style={
          {
            '--panel': theme.panel,
            '--cell': theme.cell,
            '--accent': theme.accent,
          } as React.CSSProperties
        }
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
            themeIdx={themeIdx}
            onExit={exitToMenu}
            onFinish={handleFinish}
            onNewBest={handleNewBest}
            onThemeNext={handleThemeNext}
            onToggleSound={() => updateSettings({ ...settings, sound: !settings.sound })}
            onToggleHaptics={() => updateSettings({ ...settings, haptics: !settings.haptics })}
          />
        )}
      </div>

      <Modal open={moreOpen} labelledBy="bb-more-title">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 id="bb-more-title" className="text-xl font-bold text-[#E14E7E]">
            More Games
          </h2>
          <p className="text-sm font-medium leading-relaxed text-[#B96B95]">
            A whole arcade of puzzles and adventures is on the way. Follow our channel to be the first to
            play the next hit!
          </p>
          <div className="grid w-full grid-cols-3 gap-2 py-1">
            {['Puzzle', 'Racing', 'Merge'].map((g) => (
              <div key={g} className="rounded-xl bg-[#FFF3F8] py-3 text-xs font-bold text-[#C9639A] ring-1 ring-[#FFD6EC]">
                {g}
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#E3A8C8]">
                  Soon
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="bb-btn bb-btn-pink w-full"
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
