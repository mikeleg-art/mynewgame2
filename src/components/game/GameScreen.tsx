'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CrownIcon, DiamondIcon, GearIcon, GemIcon } from './icons';
import { Volume2, VolumeX } from 'lucide-react';
import { COLORS, SHAPES, generateTray } from '@/lib/game/pieces';
import type { TrayPiece } from '@/lib/game/pieces';
import {
  N,
  createBoard,
  canPlaceAt,
  hasPlacement,
  findFullLines,
  previewClears,
  placePiece,
  clearLines,
  lineScore,
  anyMoveAvailable,
} from '@/lib/game/engine';
import type { Board, LineState } from '@/lib/game/engine';
import { sfx } from '@/lib/sound';
import { hapticImpact, hapticNotify } from '@/lib/telegram';
import { fx, GEMS } from '@/lib/game/fx';
import { THEMES } from '@/lib/game/themes';
import { GameOverModal } from './GameOverModal';
import { SettingsModal } from './SettingsModal';

const GAP = 3;

const COMBO_WORDS = ['Nice!', 'Sweet!', 'Dazzling!', 'Radiant!', 'BRILLIANT!', 'UNSTOPPABLE!'];

type DragState = {
  pieceIdx: number;
  shapeIdx: number;
  colorIdx: number;
  px: number;
  py: number;
  ghostLeft: number;
  ghostTop: number;
  r0: number;
  c0: number;
  valid: boolean;
  preview: LineState | null;
  touch: boolean;
  rect: DOMRect;
  cell: number;
  step: number;
};

type CellPop = { id: number; r: number; c: number; color: number };
type ScorePopup = { id: number; x: number; y: number; text: string; big: boolean };

type Props = {
  mode: 'classic' | 'adventure';
  best: number;
  sound: boolean;
  haptics: boolean;
  themeIdx: number;
  onExit: () => void;
  onFinish: (score: number) => void;
  onNewBest: (best: number) => void;
  onThemeNext: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
};

let fxId = 0;

export function GameScreen({
  mode,
  best,
  sound,
  haptics,
  themeIdx,
  onExit,
  onFinish,
  onNewBest,
  onThemeNext,
  onToggleSound,
  onToggleHaptics,
}: Props) {
  const [board, setBoard] = useState<Board>(() => createBoard());
  const [tray, setTray] = useState<(TrayPiece | null)[]>(() =>
    generateTray(createBoard(), (bd, si) => hasPlacement(bd as Board, si))
  );
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(500);
  const [cellSize, setCellSize] = useState(40);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [pops, setPops] = useState<CellPop[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [combo, setCombo] = useState<{ id: number; text: string } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const boardRef = useRef<Board>(board);
  boardRef.current = board;
  const bestAtStart = useRef(best);
  const bestMomentShown = useRef(false);
  const isNewBest = score > bestAtStart.current;

  // Attach the particle canvas.
  useEffect(() => {
    if (canvasRef.current) fx.attach(canvasRef.current);
    return () => fx.detach();
  }, []);

  // Keep cell metrics in sync with layout.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setCellSize((w - GAP * (N - 1)) / N);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Global listeners cleanup safety on unmount.
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, []);

  function computeGhost(st: DragState): void {
    const sh = SHAPES[st.shapeIdx];
    const pw = sh.w * st.cell + (sh.w - 1) * GAP;
    const ph = sh.h * st.cell + (sh.h - 1) * GAP;
    const lift = st.touch ? st.cell * 1.35 + 46 : 0;
    st.ghostLeft = st.px - pw / 2;
    st.ghostTop = st.touch ? st.py - lift - ph : st.py - ph / 2;
    st.c0 = Math.round((st.ghostLeft - st.rect.left) / st.step);
    st.r0 = Math.round((st.ghostTop - st.rect.top) / st.step);
    st.valid = canPlaceAt(boardRef.current, st.shapeIdx, st.r0, st.c0);
    st.preview = st.valid ? previewClears(boardRef.current, st.shapeIdx, st.r0, st.c0) : null;
  }

  function onPointerDown(e: React.PointerEvent, idx: number): void {
    if (gameOver || showSettings || !tray[idx]) return;
    e.preventDefault();
    sfx.unlock();
    const piece = tray[idx];
    if (!piece || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const cell = (rect.width - GAP * (N - 1)) / N;
    const st: DragState = {
      pieceIdx: idx,
      shapeIdx: piece.shapeIdx,
      colorIdx: piece.colorIdx,
      px: e.clientX,
      py: e.clientY,
      ghostLeft: 0,
      ghostTop: 0,
      r0: -99,
      c0: -99,
      valid: false,
      preview: null,
      touch: e.pointerType !== 'mouse',
      rect,
      cell,
      step: cell + GAP,
    };
    computeGhost(st);
    dragRef.current = st;
    setDrag({ ...st });
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }

  function onMove(e: PointerEvent): void {
    const st = dragRef.current;
    if (!st) return;
    e.preventDefault();
    st.px = e.clientX;
    st.py = e.clientY;
    computeGhost(st);
    setDrag({ ...st });
  }

  function onUp(): void {
    const st = dragRef.current;
    cleanupListeners();
    if (!st) return;
    dragRef.current = null;
    setDrag(null);
    if (st.valid) commit(st);
    else if (st.r0 > -3 && st.r0 < N + 3) sfx.invalid();
  }

  function onCancel(): void {
    cleanupListeners();
    dragRef.current = null;
    setDrag(null);
  }

  function cleanupListeners(): void {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
  }

  /** Viewport-space center of a board cell (for particles). */
  function cellCenter(rect: DOMRect, cell: number, step: number, r: number, c: number): { x: number; y: number } {
    return { x: rect.left + c * step + cell / 2, y: rect.top + r * step + cell / 2 };
  }

  function addPopup(text: ReactNode, x: number, y: number, big: boolean, ms = 950): void {
    const pid = ++fxId;
    setPopups((p) => [...p, { id: pid, x, y, text, big }]);
    window.setTimeout(() => setPopups((p) => p.filter((x2) => x2.id !== pid)), ms);
  }

  function commit(st: DragState): void {
    const { shapeIdx, colorIdx, pieceIdx, r0, c0, step, cell } = st;
    const shape = SHAPES[shapeIdx];
    let b = placePiece(boardRef.current, shapeIdx, r0, c0, colorIdx);
    const placedPts = shape.cells.length;
    const lines = findFullLines(b);
    const cleared = lines.count;
    const newStreak = cleared > 0 ? streak + 1 : 0;
    const bonus = cleared > 0 ? lineScore(cleared, newStreak) : 0;
    const gain = placedPts + bonus;
    let newScore = score + gain;

    const rect = gridRef.current?.getBoundingClientRect() ?? null;

    // placement puff — tiny happy sparkles where the piece landed
    if (rect) {
      const mid = cellCenter(rect, cell, step, r0 + (shape.h - 1) / 2, c0 + (shape.w - 1) / 2);
      fx.burst(mid.x, mid.y, {
        count: 7,
        colors: ['#ffffff', COLORS[colorIdx].light],
        shapes: ['spark', 'circle'],
        speed: 110,
        gravity: 260,
        size: 5,
        ttl: 0.5,
      });
    }

    // line-clear party: pops, particles, theme change, shake
    if (cleared > 0) {
      const fid = ++fxId;
      const newPops: CellPop[] = [];
      const seen = new Set<string>();
      for (let r = 0; r < N; r++) {
        if (lines.rows[r]) {
          for (let c = 0; c < N; c++)
            if (b[r][c] !== null) {
              newPops.push({ id: fid, r, c, color: b[r][c]! });
              seen.add(`${r}-${c}`);
            }
        }
      }
      for (let c = 0; c < N; c++) {
        if (lines.cols[c]) {
          for (let r = 0; r < N; r++)
            if (b[r][c] !== null && !seen.has(`${r}-${c}`)) {
              newPops.push({ id: fid, r, c, color: b[r][c]! });
            }
        }
      }
      setPops((p) => [...p, ...newPops]);
      window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== fid)), 620);
      b = clearLines(b, lines).board;

      // confetti-ish bursts per cell + big bursts along each cleared line
      if (rect) {
        for (const cp of newPops) {
          const mid = cellCenter(rect, cell, step, cp.r, cp.c);
          fx.burst(mid.x, mid.y, {
            count: 3,
            colors: [COLORS[cp.color].light, COLORS[cp.color].base, '#ffffff'],
            shapes: ['circle', 'spark'],
            speed: 170,
            gravity: 520,
            size: 5,
            ttl: 0.6,
          });
        }
        for (let r = 0; r < N; r++) {
          if (lines.rows[r]) {
            const mid = cellCenter(rect, cell, step, r, (N - 1) / 2);
            fx.burst(mid.x, mid.y, {
              count: 18,
              colors: GEMS,
              shapes: ['gem', 'shard', 'star'],
              speed: 320,
              gravity: 480,
              size: 9,
              ttl: 0.9,
            });
          }
        }
        for (let c = 0; c < N; c++) {
          if (lines.cols[c]) {
            const mid = cellCenter(rect, cell, step, (N - 1) / 2, c);
            fx.burst(mid.x, mid.y, {
              count: 18,
              colors: GEMS,
              shapes: ['gem', 'shard', 'star'],
              speed: 320,
              gravity: 480,
              size: 9,
              ttl: 0.9,
            });
          }
        }
      }

      // THE SPARKLE FEATURE — the whole world re-themes after every clear
      onThemeNext();
      sfx.whoosh();
      const fk = ++fxId;
      setFlashKey(fk);
      window.setTimeout(() => setFlashKey((k) => (k === fk ? 0 : k)), 650);
      const nextIdx = (themeIdx + 1) % THEMES.length;
      const nt2 = THEMES[nextIdx];
      addPopup(
        <span className="inline-flex items-center gap-2">
          <GemIcon size={26} color={nt2.gem} />
          {nt2.name}
        </span>,
        (N / 2) * step,
        1.6 * step,
        true,
        1100
      );

      // shake on multi-line blasts
      if (cleared >= 2) {
        setShakeKey((k) => k + 1);
        hapticImpact('medium', haptics);
      }
    }

    // floating score popup at the drop location
    addPopup(`+${gain}`, (c0 + shape.w / 2) * step, (r0 + shape.h / 2) * step, cleared > 0);

    // adventure level progression
    if (mode === 'adventure') {
      let lv = level;
      let tg = target;
      let leveled = false;
      while (newScore >= tg) {
        newScore += 300 + lv * 100;
        lv += 1;
        tg += 300 + lv * 150;
        leveled = true;
      }
      if (leveled) {
        setLevel(lv);
        setTarget(tg);
        sfx.levelUp();
        hapticNotify('success', haptics);
        addPopup(`LEVEL ${lv}!`, (N / 2) * step, (N / 2) * step, true);
      }
    }

    // first time crossing your best this game — celebrate!
    if (!bestMomentShown.current && bestAtStart.current > 0 && newScore > bestAtStart.current) {
      bestMomentShown.current = true;
      sfx.best();
      fx.rain({ count: 70, colors: GEMS, duration: 1300, speed: 150 });
      addPopup('NEW BEST!', (N / 2) * step, 1.4 * step, true, 1400);
      hapticNotify('success', haptics);
    }

    // tray bookkeeping + refill
    let nt: Array<TrayPiece | null> = tray.slice();
    nt[pieceIdx] = null;
    if (nt.every((x) => x === null)) {
      nt = generateTray(b, (bd, si) => hasPlacement(bd as Board, si));
    }
    if (newScore > bestAtStart.current) onNewBest(newScore);

    setBoard(b);
    setScore(newScore);
    setStreak(newStreak);
    setTray(nt);

    if (cleared > 0) {
      sfx.clear(cleared);
      hapticNotify('success', haptics);
      if (newStreak >= 2) {
        const word = COMBO_WORDS[Math.min(newStreak, COMBO_WORDS.length) - 1];
        const cid = ++fxId;
        setCombo({ id: cid, text: `${word} ×${newStreak}` });
        sfx.combo(newStreak);
        window.setTimeout(() => setCombo((cb) => (cb && cb.id === cid ? null : cb)), 1000);
        if (rect) {
          fx.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
            count: 14,
            colors: GEMS,
            shapes: ['gem', 'star'],
            speed: 260,
            gravity: 300,
            size: 8,
            ttl: 0.8,
          });
        }
      }
    } else {
      sfx.place();
      hapticImpact('light', haptics);
    }

    // game over?
    if (!anyMoveAvailable(b, nt.map((x) => (x ? x.shapeIdx : null)))) {
      const finalScore = newScore;
      const wasBest = finalScore > bestAtStart.current && bestAtStart.current > 0;
      window.setTimeout(() => {
        sfx.gameOver();
        hapticNotify('error', haptics);
        if (wasBest) fx.rain({ count: 130, colors: GEMS, duration: 2400, speed: 170 });
        setGameOver(true);
        onFinish(finalScore);
      }, 550);
    }
  }

  function restart(): void {
    const fresh = createBoard();
    setBoard(fresh);
    setTray(generateTray(fresh, (bd, si) => hasPlacement(bd as Board, si)));
    setScore(0);
    setStreak(0);
    setLevel(1);
    setTarget(500);
    setGameOver(false);
    setShowSettings(false);
    setPops([]);
    setPopups([]);
    setCombo(null);
    bestAtStart.current = best; // fix: compare against the real best, not 0
    bestMomentShown.current = false;
    sfx.click();
  }

  const stepNow = cellSize + GAP;
  const trayCell = cellSize * 0.56;
  const sh = drag ? SHAPES[drag.shapeIdx] : null;
  const progress = mode === 'adventure' ? Math.min(1, score / target) : 0;

  return (
    <div className="relative flex h-full w-full select-none flex-col items-center px-3 pb-3 pt-2">
      {/* particle canvas (over everything, incl. modals — pure eye candy) */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[70]" />

      {/* top bar */}
      <div className="flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <CrownIcon size={26} />
          <span className="text-lg font-bold text-[#FFC53D] drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]">
            {best.toLocaleString('en-US')}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label={sound ? 'Mute sound' : 'Unmute sound'}
            onClick={() => {
              sfx.unlock();
              sfx.click();
              onToggleSound();
            }}
            className="rounded-lg p-1.5 text-white/90 transition active:scale-90 hover:bg-white/10"
          >
            {sound ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <button
            type="button"
            aria-label="Settings"
            onClick={() => {
              sfx.click();
              setShowSettings(true);
            }}
            className="rounded-lg p-1.5 text-white/90 transition active:scale-90 hover:bg-white/10"
          >
            <GearIcon size={24} />
          </button>
        </div>
      </div>

      {/* score with diamond */}
      <div className="relative flex h-[62px] w-full items-center justify-center">
        <DiamondIcon size={50} className="absolute" />
        <span
          key={score}
          className="bb-score-bump relative text-[40px] font-bold leading-none text-white"
          style={{ textShadow: '0 3px 2px rgba(0,0,0,0.4), 0 0 16px rgba(255,255,255,0.35)' }}
        >
          {score.toLocaleString('en-US')}
        </span>
      </div>

      {/* adventure progress */}
      {mode === 'adventure' && (
        <div className="mb-1.5 w-[86%] max-w-[340px]">
          <div className="flex justify-between px-0.5 text-[11px] font-bold text-white/95">
            <span>Level {level}</span>
            <span>
              {score} / {target}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/25 shadow-inner ring-1 ring-white/40">
            <div
              className="bb-progress-fill h-full rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* board */}
      <div className="bb-shake-host w-full" style={{ width: 'min(94vw, 55dvh, 500px)' }}>
        <div key={shakeKey} className={`bb-board-panel p-2 ${shakeKey > 0 ? 'bb-shake' : ''}`}>
          <div className="relative">
            <div
              ref={gridRef}
              className="grid"
              style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, gap: GAP, touchAction: 'none' }}
            >
              {board.map((row, r) =>
                row.map((color, c) =>
                  color !== null ? (
                    <div
                      key={`${r}-${c}`}
                      className="bb-block"
                      data-face={(r * 3 + c) % 3}
                      style={{ width: cellSize, height: cellSize, background: COLORS[color].base }}
                    />
                  ) : (
                    <div
                      key={`${r}-${c}`}
                      className="bb-cell-empty"
                      style={{ width: cellSize, height: cellSize }}
                    />
                  )
                )
              )}
            </div>

            {/* overlays: preview + fx (aligned to grid) */}
            <div className="pointer-events-none absolute inset-0">
              {drag?.valid &&
                sh &&
                sh.cells.map(([dr, dc], i) => (
                  <div
                    key={`pv-${i}`}
                    className="bb-preview absolute"
                    style={{
                      left: (drag.c0 + dc) * drag.step,
                      top: (drag.r0 + dr) * drag.step,
                      width: drag.cell,
                      height: drag.cell,
                      background: COLORS[drag.colorIdx].base,
                    }}
                  />
                ))}
              {drag?.valid &&
                drag.preview &&
                drag.preview.rows.map((full, r) =>
                  full ? (
                    <div
                      key={`lr-${r}`}
                      className="bb-line-hint absolute"
                      style={{ left: 0, top: r * drag.step, width: N * drag.step - GAP, height: drag.cell }}
                    />
                  ) : null
                )}
              {drag?.valid &&
                drag.preview &&
                drag.preview.cols.map((full, c) =>
                  full ? (
                    <div
                      key={`lc-${c}`}
                      className="bb-line-hint absolute"
                      style={{ left: c * drag.step, top: 0, width: drag.cell, height: N * drag.step - GAP }}
                    />
                  ) : null
                )}
              {flashKey > 0 && <div key={flashKey} className="bb-theme-flash absolute inset-0 rounded-2xl" />}
              {pops.map((p) => (
                <div
                  key={`pop-${p.id}-${p.r}-${p.c}`}
                  className="bb-pop absolute"
                  style={{
                    left: p.c * stepNow,
                    top: p.r * stepNow,
                    width: cellSize,
                    height: cellSize,
                    background: COLORS[p.color].base,
                  }}
                />
              ))}
              {popups.map((p) => (
                <div
                  key={`txt-${p.id}`}
                  className={`bb-float absolute font-bold ${p.big ? 'text-2xl' : 'text-xl'} ${
                    p.big ? 'bb-float-big' : ''
                  }`}
                  style={{
                    left: p.x,
                    top: p.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {p.text}
                </div>
              ))}
            </div>

            {/* combo banner */}
            {combo && (
              <div
                key={combo.id}
                className="bb-combo pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-4xl font-bold italic"
              >
                {combo.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* tray */}
      <div className="mt-auto grid w-full max-w-[470px] grid-cols-3 gap-2" style={{ touchAction: 'none' }}>
        {tray.map((p, i) => {
          const piece = p ? SHAPES[p.shapeIdx] : null;
          return (
            <div
              key={`slot-${i}`}
              className="flex items-center justify-center rounded-2xl"
              style={{ height: cellSize * 3.05, touchAction: 'none' }}
              onPointerDown={(e) => p && onPointerDown(e, i)}
              role="button"
              aria-label={piece ? `Drag piece ${i + 1}` : 'Empty slot'}
            >
              {p && piece && drag?.pieceIdx !== i && (
                <div
                  className="bb-tray-piece grid cursor-grab"
                  style={{ gridTemplateColumns: `repeat(${piece.w}, ${trayCell}px)`, gap: 2 }}
                >
                  {piece.cells.map(([r, c], j) => (
                    <div
                      key={j}
                      className="bb-block-sm"
                      data-face={j % 3}
                      style={{
                        width: trayCell,
                        height: trayCell,
                        background: COLORS[p.colorIdx].base,
                        gridRow: r + 1,
                        gridColumn: c + 1,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* drag ghost */}
      {drag && sh && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: drag.ghostLeft,
            top: drag.ghostTop,
            display: 'grid',
            gridTemplateColumns: `repeat(${sh.w}, ${drag.cell}px)`,
            gap: GAP,
            filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.35))',
          }}
        >
          {sh.cells.map(([r, c], j) => (
            <div
              key={j}
              className="bb-block"
              data-face={0}
              style={{
                width: drag.cell,
                height: drag.cell,
                background: COLORS[drag.colorIdx].base,
                gridRow: r + 1,
                gridColumn: c + 1,
              }}
            />
          ))}
        </div>
      )}

      <SettingsModal
        open={showSettings}
        sound={sound}
        haptics={haptics}
        onToggleSound={onToggleSound}
        onToggleHaptics={onToggleHaptics}
        onRestart={restart}
        onMenu={onExit}
        onClose={() => setShowSettings(false)}
      />
      <GameOverModal
        open={gameOver}
        score={score}
        best={best}
        isNewBest={isNewBest}
        onRestart={restart}
        onMenu={onExit}
      />
    </div>
  );
}
