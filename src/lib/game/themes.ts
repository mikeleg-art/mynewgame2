/**
 * Cute pastel themes for Blocky Pop!
 * The whole page re-themes with a dreamy crossfade every time the player
 * clears lines — each theme has its own name, vibe and decoration colors.
 */

export type CuteTheme = {
  name: string;
  emoji: string;
  /** Page background: 3-stop vertical gradient (top → bottom) */
  page: [string, string, string];
  /** Board frame (solid color — animates smoothly) */
  panel: string;
  /** Empty cell inside the board (solid color) */
  cell: string;
  /** Accent used for popups / highlights */
  accent: string;
  /** Telegram header / background color */
  header: string;
  /** Colors of floating decorations (clouds, hearts, stars) */
  decor: string[];
};

export const THEMES: CuteTheme[] = [
  {
    name: 'Bubblegum',
    emoji: '🌸',
    page: ['#ffd9ef', '#ffabd8', '#f57fc0'],
    panel: '#b34f91',
    cell: '#cf6fae',
    accent: '#ff5fb0',
    header: '#f57fc0',
    decor: ['#ffffff', '#ffe3f2', '#ffc7e6'],
  },
  {
    name: 'Minty',
    emoji: '🌿',
    page: ['#d8f7e8', '#a9e9cb', '#7cd8ae'],
    panel: '#3f9d78',
    cell: '#66bd96',
    accent: '#2fbf8f',
    header: '#7cd8ae',
    decor: ['#ffffff', '#e2fbf0', '#bdf2dc'],
  },
  {
    name: 'Bubbly Sky',
    emoji: '☁️',
    page: ['#dcedff', '#aed8ff', '#82bcf8'],
    panel: '#3d7cc9',
    cell: '#6ba2dd',
    accent: '#3f9bff',
    header: '#82bcf8',
    decor: ['#ffffff', '#eef7ff', '#cfe6ff'],
  },
  {
    name: 'Peachy',
    emoji: '🍑',
    page: ['#ffead9', '#ffcaa6', '#ffab77'],
    panel: '#d97b3f',
    cell: '#eb9f68',
    accent: '#ff8c42',
    header: '#ffab77',
    decor: ['#ffffff', '#fff3e6', '#ffdec2'],
  },
  {
    name: 'Lavender',
    emoji: '💜',
    page: ['#eddcff', '#cdb3f7', '#a989ec'],
    panel: '#7151c2',
    cell: '#9478d8',
    accent: '#9d5cff',
    header: '#a989ec',
    decor: ['#ffffff', '#f4ebff', '#dcc8ff'],
  },
  {
    name: 'Lemon',
    emoji: '🍋',
    page: ['#fff8d6', '#ffe992', '#ffd75e'],
    panel: '#d99e1f',
    cell: '#e9bc4e',
    accent: '#ffb300',
    header: '#ffd75e',
    decor: ['#ffffff', '#fffbe8', '#fff0b3'],
  },
];

export function nextTheme(idx: number): number {
  return (idx + 1) % THEMES.length;
}

/** Build the layered cute background (glow + dots + gradient). */
export function themeBg(t: CuteTheme): string {
  return [
    'radial-gradient(circle at 22% 10%, rgba(255,255,255,0.45) 0, rgba(255,255,255,0) 34%)',
    'radial-gradient(circle at 82% 84%, rgba(255,255,255,0.28) 0, rgba(255,255,255,0) 30%)',
    'radial-gradient(rgba(255,255,255,0.16) 1.6px, transparent 1.7px)',
    `linear-gradient(180deg, ${t.page[0]} 0%, ${t.page[1]} 52%, ${t.page[2]} 100%)`,
  ].join(', ');
}
