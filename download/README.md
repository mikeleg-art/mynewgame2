# Blocky Pop! — kawaii Telegram block puzzle 🎀

A cute, pastel re-theme of the classic block-blast puzzle, built as a Telegram
Mini App (also runs in any browser). Formerly "Block Blast — Adventure Master".

## What's new in this version

1. **Cute theme everywhere** — every candy block has a kawaii face (eyes, blush,
   smile in 3 variants), a crowned cube mascot "Blocky" greets you, and all
   cards/buttons are pastel candy styled.
2. **The world re-themes after every clear** — 6 pastel worlds (Bubblegum 🌸,
   Minty 🌿, Bubbly Sky ☁️, Peachy 🍑, Lavender 💜, Lemon 🍋) crossfade in with a
   white bloom flash + whoosh sound each time you pop lines. The menu slowly
   cycles them on its own; Telegram header color follows along.
3. **Juicy effects** — canvas particle bursts (stars, hearts, confetti, sparks)
   per cleared cell, confetti rain on new-best, screen shake on multi-line
   blasts, squish-in placement animation, happy-faced blocks that spin away,
   floating score popups, chatty combo banners ("Sweet! ×2 … UNSTOPPABLE!").
4. **New name** — brainstormed and renamed to **Blocky Pop!** (tagline:
   POP · MATCH · SPARKLE), new candy logo + metadata.

Also: quick sound toggle in the top bar, fixed the "NEW BEST" ribbon showing on
every game after a restart, tray pieces gently bob.

## Gameplay

- 8×8 board, drag pieces from the tray of 3, fill full rows/columns to pop.
- Clearing consecutive placements builds a combo streak; bigger multi-line
  clears score non-linearly (100 / 300 / 600 / 1000…).
- Game over when no tray piece fits. Adventure mode adds level targets.
- Best score persists locally + Telegram CloudStorage.

## Run

```bash
bun run dev    # http://localhost:3000 (already running for preview)
bun run build  # production build
```

Telegram Mini App: point your bot's menu button at the deployed URL; the game
auto-integrates `telegram-web-app.js` (haptics, expand, cloud saves) with safe
browser fallbacks.

## Key files

- `src/components/game/` — screens, modals, mascot, logo
- `src/lib/game/themes.ts` — the 6 pastel worlds
- `src/lib/game/fx.ts` — zero-dependency particle engine
- `src/lib/game/{engine,pieces,storage}.ts` — board logic, shapes, saves
- `src/lib/sound.ts` — tiny WebAudio synth (no audio assets)
