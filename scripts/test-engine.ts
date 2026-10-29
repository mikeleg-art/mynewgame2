/**
 * Engine smoke test — run with: bun /home/z/my-project/scripts/test-engine.ts
 * Verifies placement, line clearing, scoring, game-over detection and bag fairness.
 */
import {
  N,
  createBoard,
  canPlaceAt,
  hasPlacement,
  findFullLines,
  placePiece,
  clearLines,
  lineScore,
  anyMoveAvailable,
} from '../src/lib/game/engine';
import { SHAPES, generateTray } from '../src/lib/game/pieces';

let failures = 0;
function check(name: string, cond: boolean): void {
  if (cond) {
    console.log(`  ok - ${name}`);
  } else {
    failures++;
    console.error(`  FAIL - ${name}`);
  }
}

console.log('shape count:', SHAPES.length);

// 1. basic placement
let board = createBoard();
const vLine3 = SHAPES.findIndex((s) => s.w === 1 && s.h === 3);
check('vertical 3-line exists', vLine3 >= 0);
check('can place at 0,0', canPlaceAt(board, vLine3, 0, 0));
check('cannot place out of bounds', !canPlaceAt(board, vLine3, N - 1, 0));
board = placePiece(board, vLine3, 0, 0, 0);
check('cell occupied after place', board[2][0] === 0);
check('cannot overlap', !canPlaceAt(board, vLine3, 1, 0));

// 2. full row clear
for (let c = 1; c < N; c++) board = placePiece(board, 0, 0, c, 1); // singles fill row 0
let lines = findFullLines(board);
check('row 0 detected full', lines.rows[0] === true && lines.count === 1);
const cleared = clearLines(board, lines);
check('8 cells cleared from row', cleared.cleared === 8);
check('row 0 empty after clear', cleared.board[0].every((c) => c === null));
check('col 0 rows 1-2 still filled', cleared.board[1][0] === 0 && cleared.board[2][0] === 0);

// 3. simultaneous row+col clear scoring
let b2 = createBoard();
for (let c = 0; c < N; c++) b2 = placePiece(b2, 0, 0, c, 1); // row 0
for (let r = 1; r < N; r++) b2 = placePiece(b2, 0, r, 0, 2); // col 0 (overlap cell already set)
lines = findFullLines(b2);
check('row+col full => count 2', lines.count === 2);
check('lineScore(2, streak1) = 300', lineScore(2, 1) === 300);
check('lineScore(1, streak3) = 300 (100+200)', lineScore(1, 3) === 300);

// 4. game over detection
let b3 = createBoard();
// fill everything except a 1x1 hole at bottom-right
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    if (!(r === N - 1 && c === N - 1)) b3 = placePiece(b3, 0, r, c, 3);
  }
}
const single = SHAPES.findIndex((s) => s.w === 1 && s.h === 1);
const bigSq = SHAPES.findIndex((s) => s.w === 3 && s.h === 3);
check('single fits in hole', hasPlacement(b3, single));
check('3x3 does not fit', !hasPlacement(b3, bigSq));
check('anyMove true with single in tray', anyMoveAvailable(b3, [null, single, null]));
check('anyMove false with big pieces', !anyMoveAvailable(b3, [bigSq, bigSq, null]));

// 5. bag fairness — tray on nearly-full board should prefer fitting sets
let b4 = createBoard();
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    if (!(r === N - 1 && c === N - 1)) b4 = placePiece(b4, 0, r, c, 4);
  }
}
let fittingSets = 0;
for (let i = 0; i < 50; i++) {
  const tray = generateTray(b4, (bd, si) => hasPlacement(bd as typeof b4, si));
  if (tray.some((p) => hasPlacement(b4, p.shapeIdx))) fittingSets++;
}
check(`fairness: ${fittingSets}/50 trays fit a 1x1 hole (expect 50)`, fittingSets === 50);

console.log(failures === 0 ? 'ALL ENGINE TESTS PASSED' : `${failures} FAILURES`);
if (failures > 0) process.exit(1);
