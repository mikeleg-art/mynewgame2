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

/** Blocky Pop! candy palette — bright pastels that kawaii faces love. */
export const COLORS: Array<{ base: string; light: string; dark: string }> = [
  { base: '#5ED77A', light: '#A8F0B8', dark: '#2FA556' }, // apple green
  { base: '#FFA45C', light: '#FFD0A3', dark: '#F07E1F' }, // peachy orange
  { base: '#FFD84D', light: '#FFF0A8', dark: '#F0B400' }, // banana yellow
  { base: '#FF6B81', light: '#FFA8B5', dark: '#E93A56' }, // strawberry
  { base: '#6FB6FF', light: '#B0DBFF', dark: '#2F8BE8' }, // blueberry
  { base: '#C08BFF', light: '#E0C4FF', dark: '#9550EA' }, // grape
  { base: '#4ED8DA', light: '#A0EFEF', dark: '#1FA9AB' }, // mint teal
  { base: '#FF8CC8', light: '#FFC3E2', dark: '#F05FA4' }, // bubblegum pink
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
