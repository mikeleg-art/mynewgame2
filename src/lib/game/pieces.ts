/**
 * Block Blast piece definitions & bag generation.
 * Shapes are parsed from ASCII art ('#' = filled cell).
 */

export type Shape = {
  id: number;
  cells: [number, number][]; // [row, col] offsets from top-left
  w: number;
  h: number;
  weight: number;
};

export type TrayPiece = {
  uid: string;
  shapeIdx: number;
  colorIdx: number;
};

function parse(pattern: string[], weight: number, id: number): Shape {
  const cells: [number, number][] = [];
  const h = pattern.length;
  const w = Math.max(...pattern.map((r) => r.length));
  pattern.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '#') cells.push([r, c]);
    }
  });
  return { id, cells, w, h, weight };
}

const DEFS: Array<[string[], number]> = [
  // single
  [['#'], 5],
  // dominoes
  [['##'], 9],
  [['#', '#'], 9],
  // tromino lines
  [['###'], 9],
  [['#', '#', '#'], 9],
  // small corners (3 cells)
  [['##', '#.'], 6],
  [['##', '.#'], 6],
  [['#.', '##'], 6],
  [['.#', '##'], 6],
  // tetromino lines
  [['####'], 6],
  [['#', '#', '#', '#'], 6],
  // square 2x2
  [['##', '##'], 9],
  // rect 2x3
  [['###', '###'], 4],
  [['##', '##', '##'], 4],
  // T tetrominoes
  [['###', '.#.'], 4],
  [['.#.', '###'], 4],
  [['#.', '##', '#.'], 4],
  [['.#', '##', '.#'], 4],
  // S / Z
  [['##.', '.##'], 3],
  [['.##', '##.'], 3],
  [['#.', '##', '.#'], 3],
  [['.#', '##', '#.'], 3],
  // L / J tetrominoes
  [['#.', '#.', '##'], 3],
  [['.#', '.#', '##'], 3],
  [['##', '#.', '#.'], 3],
  [['##', '.#', '.#'], 3],
  [['###', '#..', '#..'], 3],
  [['###', '..#', '..#'], 3],
  [['#..', '#..', '###'], 3],
  [['..#', '..#', '###'], 3],
  // pentomino lines
  [['#####'], 3],
  [['#', '#', '#', '#', '#'], 3],
  // big 3x3 corner (5 cells)
  [['###', '#..', '#..'], 3],
  [['###', '..#', '..#'], 3],
  [['#..', '#..', '###'], 3],
  [['..#', '..#', '###'], 3],
  // 3x3 square
  [['###', '###', '###'], 2],
];

export const SHAPES: Shape[] = DEFS.map((d, i) => parse(d[0], d[1], i));

const TOTAL_WEIGHT = SHAPES.reduce((s, sh) => s + sh.weight, 0);

/** Block Blast-like vivid block palette. */
export const COLORS: Array<{ base: string; light: string; dark: string }> = [
  { base: '#4CC94C', light: '#8FE88F', dark: '#2E9E2E' }, // green
  { base: '#FFA726', light: '#FFCC80', dark: '#E07C00' }, // orange
  { base: '#FFD54F', light: '#FFECB3', dark: '#E6A800' }, // yellow
  { base: '#EF5350', light: '#FF8A80', dark: '#C62828' }, // red
  { base: '#42A5F5', light: '#90CAF9', dark: '#1565C0' }, // blue
  { base: '#AB47BC', light: '#CE93D8', dark: '#7B1FA2' }, // purple
  { base: '#26C6DA', light: '#80DEEA', dark: '#0097A7' }, // teal
  { base: '#EC407A', light: '#F48FB1', dark: '#AD1457' }, // pink
];

export function randomShapeIdx(): number {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < SHAPES.length; i++) {
    roll -= SHAPES[i].weight;
    if (roll <= 0) return i;
  }
  return 0;
}

export function randomColorIdx(): number {
  return Math.floor(Math.random() * COLORS.length);
}

let uidCounter = 0;
export function makeUid(): string {
  uidCounter += 1;
  return `p${Date.now().toString(36)}_${uidCounter}`;
}

/**
 * Generate a fresh set of 3 tray pieces.
 * Fairness: if the board can still accept at least one shape, guarantee that
 * at least one of the 3 pieces is placeable (bias a random slot toward a
 * fitting shape). Game over is still possible whenever NO shape fits anymore.
 */
export function generateTray<T>(
  board: T[][],
  fits: (board: T[][], shapeIdx: number) => boolean
): TrayPiece[] {
  const fitting: number[] = [];
  for (let i = 0; i < SHAPES.length; i++) {
    if (fits(board, i)) fitting.push(i);
  }

  const tray: TrayPiece[] = Array.from({ length: 3 }, () => ({
    uid: makeUid(),
    shapeIdx: randomShapeIdx(),
    colorIdx: randomColorIdx(),
  }));

  if (fitting.length > 0 && !tray.some((p) => fits(board, p.shapeIdx))) {
    const slot = Math.floor(Math.random() * 3);
    tray[slot] = {
      uid: makeUid(),
      shapeIdx: fitting[Math.floor(Math.random() * fitting.length)],
      colorIdx: randomColorIdx(),
    };
  }
  return tray;
}
