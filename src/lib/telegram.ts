/**
 * Telegram Mini App (WebApp) integration with safe fallbacks so the game
 * also runs perfectly in a plain browser.
 */

type TgHapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type TgNotifyType = 'error' | 'success' | 'warning';

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  isExpanded: boolean;
  initDataUnsafe?: { user?: { first_name?: string; username?: string } };
  HapticFeedback?: {
    impactOccurred: (style: TgHapticStyle) => void;
    notificationOccurred: (type: TgNotifyType) => void;
    selectionChanged: () => void;
  };
  CloudStorage?: {
    getItem: (k: string, cb: (e: unknown, v: string | undefined) => void) => void;
    setItem: (k: string, v: string, cb: (e: unknown) => void) => void;
  };
};

export function tg(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { Telegram?: { WebApp?: TelegramWebApp } };
  return w.Telegram?.WebApp ?? null;
}

export function initTelegram(): void {
  const app = tg();
  if (!app) return;
  try {
    app.ready();
    app.expand();
    app.disableVerticalSwipes?.();
    app.setHeaderColor?.('#f57fc0');
    app.setBackgroundColor?.('#f57fc0');
  } catch {
    /* older clients */
  }
}

export function hapticImpact(style: TgHapticStyle, enabled = true): void {
  if (!enabled) return;
  try {
    tg()?.HapticFeedback?.impactOccurred(style);
  } catch {
    /* noop */
  }
}

export function hapticNotify(type: TgNotifyType, enabled = true): void {
  if (!enabled) return;
  try {
    tg()?.HapticFeedback?.notificationOccurred(type);
  } catch {
    /* noop */
  }
}

export function hapticSelect(enabled = true): void {
  if (!enabled) return;
  try {
    tg()?.HapticFeedback?.selectionChanged();
  } catch {
    /* noop */
  }
}

/** Keep the Telegram client chrome in sync with the current cute theme. */
export function setTgColor(color: string): void {
  const app = tg();
  if (!app) return;
  try {
    app.setHeaderColor?.(color);
    app.setBackgroundColor?.(color);
  } catch {
    /* older clients */
  }
}

/** Read a value from Telegram CloudStorage (if available). Resolves null on failure. */
export function cloudGet(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    const storage = tg()?.CloudStorage;
    if (!storage) return resolve(null);
    try {
      storage.getItem(key, (_e, v) => resolve(typeof v === 'string' ? v : null));
    } catch {
      resolve(null);
    }
  });
}

export function cloudSet(key: string, value: string): void {
  const storage = tg()?.CloudStorage;
  if (!storage) return;
  try {
    storage.setItem(key, value, () => {});
  } catch {
    /* noop */
  }
}
