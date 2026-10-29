/** Local persistence helpers (localStorage + Telegram CloudStorage mirror). */

export type Settings = {
  sound: boolean;
  haptics: boolean;
};

export type DailyStreak = {
  /** ISO date (YYYY-MM-DD) of the last finished game */
  lastDate: string | null;
  count: number;
};

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

function lsGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

export function loadBest(): number {
  return parseInt(lsGet('bb_best') ?? '0', 10) || 0;
}

export function saveBest(best: number): void {
  lsSet('bb_best', String(best));
}

export function loadSettings(): Settings {
  try {
    const raw = lsGet('bb_settings');
    if (raw) {
      const s = JSON.parse(raw) as Partial<Settings>;
      return { sound: s.sound !== false, haptics: s.haptics !== false };
    }
  } catch {
    /* corrupted */
  }
  return { sound: true, haptics: true };
}

export function saveSettings(s: Settings): void {
  lsSet('bb_settings', JSON.stringify(s));
}

export function loadStreak(): DailyStreak {
  try {
    const raw = lsGet('bb_daily');
    if (raw) {
      const d = JSON.parse(raw) as DailyStreak;
      if (typeof d.count === 'number') return d;
    }
  } catch {
    /* corrupted */
  }
  return { lastDate: null, count: 0 };
}

/** Called once per finished game — keeps a "consecutive days played & won" streak. */
export function bumpStreak(): DailyStreak {
  const cur = loadStreak();
  const today = todayISO();
  if (cur.lastDate === today) return cur;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const next: DailyStreak =
    cur.lastDate === yesterday ? { lastDate: today, count: cur.count + 1 } : { lastDate: today, count: 1 };
  lsSet('bb_daily', JSON.stringify(next));
  return next;
}
