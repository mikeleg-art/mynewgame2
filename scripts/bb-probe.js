(() => {
  // Probe: start a drag on the first non-empty slot, move to target, inspect
  // drag state via DOM (ghost + preview), then finish and report.
  const PI = Number(__PI__);
  const PX = Number(__PX__);
  const PY = Number(__PY__);
  const slots = [...document.querySelectorAll('[aria-label^="Drag piece"]')];
  const slot = slots[PI];
  if (!slot) return JSON.stringify({ err: 'no slot', slots: slots.length });
  const sr = slot.getBoundingClientRect();
  const base = { bubbles: true, cancelable: true, pointerId: 9, pointerType: 'mouse', button: 0, isPrimary: true };
  slot.dispatchEvent(new PointerEvent('pointerdown', { ...base, clientX: sr.x + sr.width / 2, clientY: sr.y + sr.height / 2 }));
  window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientX: PX, clientY: PY }));
  const ghost = !!document.querySelector('.fixed.z-50');
  const preview = document.querySelectorAll('.pointer-events-none.absolute.inset-0 > .absolute.rounded-\\[24\\%\\]').length;
  window.dispatchEvent(new PointerEvent('pointerup', { ...base, clientX: PX, clientY: PY }));
  return JSON.stringify({ ghost, previewCells: preview });
})()
