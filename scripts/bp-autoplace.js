(() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const GAP = 3;
  const results = [];
  const placeOne = () => {
    const grid = document.querySelector('.bb-board-panel .grid');
    if (!grid) return { err: 'no grid' };
    const cells = [...grid.children];
    const occ = cells.map((el) => el.classList.contains('bb-block'));
    const slots = [...document.querySelectorAll('[aria-label^="Drag piece"]')];
    const slotIdx = slots.findIndex((s) => s.querySelector('.bb-block-sm'));
    if (slotIdx < 0) return { err: 'no pieces' };
    const slot = slots[slotIdx];
    const pieceGrid = slot.querySelector('.grid');
    const pieceCells = [...pieceGrid.querySelectorAll('.bb-block-sm')].map((el) => ({
      r: parseInt(el.style.gridRow) - 1,
      c: parseInt(el.style.gridColumn) - 1,
    }));
    const h = Math.max(...pieceCells.map((p) => p.r)) + 1;
    const w = Math.max(...pieceCells.map((p) => p.c)) + 1;
    let target = null;
    outer: for (let r = 0; r <= 8 - h; r++) {
      for (let c = 0; c <= 8 - w; c++) {
        if (pieceCells.every((p) => !occ[(r + p.r) * 8 + (c + p.c)])) {
          target = { r, c };
          break outer;
        }
      }
    }
    if (!target) return { err: 'no placement' };
    const gr = grid.getBoundingClientRect();
    const cell = (gr.width - GAP * 7) / 8;
    const step = cell + GAP;
    const pw = w * cell + (w - 1) * GAP;
    const ph = h * cell + (h - 1) * GAP;
    const px = gr.left + target.c * step + pw / 2;
    const py = gr.top + target.r * step + ph / 2;
    const sr = slot.getBoundingClientRect();
    const base = { bubbles: true, cancelable: true, pointerId: 9, pointerType: 'mouse', button: 0, isPrimary: true };
    slot.dispatchEvent(new PointerEvent('pointerdown', { ...base, clientX: sr.x + sr.width / 2, clientY: sr.y + sr.height / 2 }));
    window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientX: px, clientY: py }));
    window.dispatchEvent(new PointerEvent('pointerup', { ...base, clientX: px, clientY: py }));
    return { ok: true, r: target.r, c: target.c, w, h };
  };
  return (async () => {
    for (let i = 0; i < 16; i++) {
      results.push(placeOne());
      await sleep(240);
    }
    return JSON.stringify(results);
  })();
})()
