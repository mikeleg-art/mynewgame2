/**
 * Pure board logic for Block Blast. Board is an N x N grid of `number | null`
 * where numbers index into COLORS and null means empty.
 */
import { SHAPES } from './pieces';

export const N = 8;

export type Cell = number | null;
export type Board = Cell[][];

export function createBoard(): Board {
  return Array.from({ length: N }, () => Array<Cell>(N).fill(null));
}

export function cloneBoard(b: Board): Board {
  return b.map((row) => row.slice());
}

export function shapeCells(shapeIdx: number): [number, number][] {
  return SHAPES[shapeIdx].cells;
}

export function canPlaceAt(board: Board, shapeIdx: number, r0: number, c0: number): boolean {
  const cells = SHAPES[shapeIdx].cells;
  for (let i = 0; i < cells.length; i++) {
    const r = r0 + cells[i][0];
    const c = c0 + cells[i][1];
    if (r < 0 || r >= N || c < 0 || c >= N) return false;
    if (board[r][c] !== null) return false;
  }
  return true;
}

/** Is there any position on the board where this shape fits? */
export function hasPlacement(board: Board, shapeIdx: number): boolean {
  for (let r = 0; r <= N - SHAPES[shapeIdx].h; r++) {
    for (let c = 0; c <= N - SHAPES[shapeIdx].w; c++) {
      if (canPlaceAt(board, shapeIdx, r, c)) return true;
    }
  }
  return false;
}

export type LineState = { rows: boolean[]; cols: boolean[]; count: number };

/** Which full rows / columns exist on this board right now. */
export function findFullLines(board: Board): LineState {
  const rows = new Array<boolean>(N).fill(false);
  const cols = new Array<boolean>(N).fill(false);
  let count = 0;
  for (let r = 0; r < N; r++) {
    let full = true;
    for (let c = 0; c < N; c++) {
      if (board[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      rows[r] = true;
      count++;
    }
  }
  for (let c = 0; c < N; c++) {
    let full = true;
    for (let r = 0; r < N; r++) {
      if (board[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      cols[c] = true;
      count++;
    }
  }
  return { rows, cols, count };
}

/**
 * Simulate placing a piece and report which lines WOULD be completed
 * (used for the glowing drop preview).
 */
export function previewClears(board: Board, shapeIdx: number, r0: number, c0: number): LineState {
  const b = cloneBoard(board);
  const cells = SHAPES[shapeIdx].cells;
  for (let i = 0; i < cells.length; i++) {
    b[r0 + cells[i][0]][c0 + cells[i][1]] = 0;
  }
  return findFullLines(b);
}

/** Place a piece onto a cloned board (no line removal). */
export function placePiece(board: Board, shapeIdx: number, r0: number, c0: number, colorIdx: number): Board {
  const b = cloneBoard(board);
  const cells = SHAPES[shapeIdx].cells;
  for (let i = 0; i < cells.length; i++) {
    b[r0 + cells[i][0]][c0 + cells[i][1]] = colorIdx;
  }
  return b;
}

/** Remove all full rows/cols from the board. Returns number of cleared cells. */
export function clearLines(board: Board, lines: LineState): { board: Board; cleared: number } {
  const b = cloneBoard(board);
  let cleared = 0;
  for (let r = 0; r < N; r++) {
    if (lines.rows[r]) {
      for (let c = 0; c < N; c++) {
        if (b[r][c] !== null) cleared++;
        b[r][c] = null;
      }
    }
  }
  for (let c = 0; c < N; c++) {
    if (lines.cols[c]) {
      for (let r = 0; r < N; r++) {
        if (b[r][c] !== null) cleared++;
        b[r][c] = null;
      }
    }
  }
  return { board: b, cleared };
}

/**
 * Scoring: base award per simultaneous lines + streak bonus for
 * consecutive placements that clear something.
 */
export function lineScore(lines: number, streak: number): number {
  const base = [0, 100, 300, 600, 1000, 1500, 2100][Math.min(lines, 6)];
  const streakBonus = streak > 1 ? (streak - 1) * 100 : 0;
  return base + streakBonus;
}

export type GameState = 'playing' | 'over';

/** Can any of the remaining tray pieces still be placed? */
export function anyMoveAvailable(board: Board, trayShapeIdxs: Array<number | null>): boolean {
  return trayShapeIdxs.some((s) => s !== null && hasPlacement(board, s));
}
