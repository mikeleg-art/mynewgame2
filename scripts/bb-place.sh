#!/bin/bash
# Drives Block Blast via synthetic pointer events until row 0 clears (score >= 100)
set -e
PI="$1"; PX="$2"; PY="$3"
agent-browser eval "(() => {
  const slots = [...document.querySelectorAll('[aria-label^=\"Drag piece\"]')];
  const slot = slots[$PI];
  if (!slot) return 'no slot $PI';
  const sr = slot.getBoundingClientRect();
  const base = { bubbles: true, cancelable: true, pointerId: 9, pointerType: 'mouse', button: 0, isPrimary: true };
  slot.dispatchEvent(new PointerEvent('pointerdown', { ...base, clientX: sr.x + sr.width / 2, clientY: sr.y + sr.height / 2 }));
  window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientX: $PX, clientY: $PY }));
  window.dispatchEvent(new PointerEvent('pointerup', { ...base, clientX: $PX, clientY: $PY }));
  return 'ok';
})()"
