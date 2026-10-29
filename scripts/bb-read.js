(() => {
  const grid = document.querySelector('.grid');
  if (!grid) return JSON.stringify({ error: 'no grid' });
  const g = grid.getBoundingClientRect();
  const cell = (g.width - 21) / 8;
  const step = cell + 3;
  const cells = [...grid.children];
  const board = [];
  for (let r = 0; r < 8; r++) {
    const row = [];
    for (let c = 0; c < 8; c++) {
      row.push(cells[r * 8 + c].className.includes('bb-block') ? 1 : 0);
    }
    board.push(row);
  }
  const tray = [...document.querySelectorAll('[aria-label^="Drag piece"]')].map((slot, idx) => {
    const pieceGrid = slot.querySelector('.grid');
    if (!pieceGrid) return null;
    const m = pieceGrid.style.gridTemplateColumns.match(/repeat\((\d+)/);
    const w = m ? +m[1] : 1;
    const cellEls = [...pieceGrid.children];
    const cw = cellEls[0].getBoundingClientRect().width;
    const ch = cellEls[0].getBoundingClientRect().height;
    const pr = pieceGrid.getBoundingClientRect();
    const pos = cellEls.map((el) => {
      const r = el.getBoundingClientRect();
      return [Math.round((r.y - pr.y) / (ch + 2)), Math.round((r.x - pr.x) / (cw + 2))];
    });
    const h = Math.max(...pos.map((p) => p[0])) + 1;
    return { idx, w, h, cells: pos };
  });
  return JSON.stringify({ gx: g.x, gy: g.y, cell, step, board, tray });
})()
