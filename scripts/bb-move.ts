/**
 * Greedy move picker: reads game state JSON from stdin, picks the tray piece +
 * placement that best fills row 0 (then row 1), outputs pointer coords for a
 * mouse-centered drag ghost.
 */
import * as readline from 'node:readline';

type Piece = { idx: number; w: number; h: number; cells: number[][] };
type State = {
  gx: number;
  gy: number;
  cell: number;
  step: number;
  board: number[][];
  tray: Array<Piece | null>;
};

const rl = readline.createInterface({ input: process.stdin });
let raw = '';
rl.on('line', (l) => (raw += l));
rl.on('close', () => {
  const s: State = JSON.parse(raw);
  const GAP = 3;
  let best: { pieceIdx: number; r0: number; c0: number; score: number } | null = null;

  for (const p of s.tray) {
    if (!p) continue;
    const pw = p.w * s.cell + (p.w - 1) * GAP;
    const ph = p.h * s.cell + (p.h - 1) * GAP;
    for (let r0 = 0; r0 <= 8 - p.h; r0++) {
      for (let c0 = 0; c0 <= 8 - p.w; c0++) {
        let ok = true;
        let row0 = 0;
        let row1 = 0;
        let n = 0;
        for (const [dr, dc] of p.cells) {
          const r = r0 + dr;
          const c = c0 + dc;
          if (s.board[r][c]) {
            ok = false;
            break;
          }
          n++;
          if (r === 0) row0++;
          if (r === 1) row1++;
        }
        if (!ok) continue;
        // compact top-down packing to force a deadlock quickly
        const score = n * 10 - r0 * 31 - c0 * 1.5;
        if (!best || score > best.score) best = { pieceIdx: p.idx, r0, c0, score };
      }
    }
  }

  if (!best) {
    console.log(JSON.stringify({ done: true }));
    return;
  }
  const p = s.tray[best.pieceIdx]!;
  const pw = p.w * s.cell + (p.w - 1) * GAP;
  const ph = p.h * s.cell + (p.h - 1) * GAP;
  const px = s.gx + best.c0 * s.step + pw / 2;
  const py = s.gy + best.r0 * s.step + ph / 2;
  console.log(JSON.stringify({ pieceIdx: best.pieceIdx, px, py }));
});
