/**
 * Cute crystal worlds for Blocky Pop!
 * The whole page re-themes with a dreamy crossfade every time the player
 * clears lines — each world is named after a gemstone and has its own
 * palette and decoration colors.
 */

export type CuteTheme = {
  name: string;
  /** Light gem tone used for the little crystal icon in the theme popup */
  gem: string;
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
  /** Colors of floating decorations (clouds, gems, sparkles) */
  decor: string[];
};

export const THEMES: CuteTheme[] = [
  {
    name: 'Rose Quartz',
    gem: '#ffd1e6',
    page: ['#ffe0ef', '#ffb3d6', '#ff87c4'],
    panel: '#b34f91',
    cell: '#cf6fae',
    accent: '#ff5fb0',
    header: '#ff87c4',
    decor: ['#ffffff', '#ffe3f2', '#ffc7e6'],
  },
  {
    name: 'Peridot',
    gem: '#c2f4d8',
    page: ['#d9f7e8', '#a5e9c9', '#77d8a9'],
    panel: '#3f9d78',
    cell: '#66bd96',
    accent: '#2fbf8f',
    header: '#77d8a9',
    decor: ['#ffffff', '#e2fbf0', '#bdf2dc'],
  },
  {
    name: 'Aquamarine',
    gem: '#c4edff',
    page: ['#dcf6ff', '#a9dff7', '#7ac2ea'],
    panel: '#3a7fc4',
    cell: '#66a8d9',
    accent: '#3f9bff',
    header: '#7ac2ea',
    decor: ['#ffffff', '#eef7ff', '#cfe6ff'],
  },
  {
    name: 'Citrine',
    gem: '#ffe4b8',
    page: ['#ffeedb', '#ffcba4', '#ffa974'],
    panel: '#d97b3f',
    cell: '#eb9f68',
    accent: '#ff8c42',
    header: '#ffa974',
    decor: ['#ffffff', '#fff3e6', '#ffdec2'],
  },
  {
    name: 'Amethyst',
    gem: '#e2cdff',
    page: ['#eeddff', '#cdb2f7', '#a685ec'],
    panel: '#7151c2',
    cell: '#9478d8',
    accent: '#9d5cff',
    header: '#a685ec',
    decor: ['#ffffff', '#f4ebff', '#dcc8ff'],
  },
  {
    name: 'Golden Topaz',
    gem: '#fff0b0',
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
