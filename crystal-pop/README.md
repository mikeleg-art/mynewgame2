# Crystal Pop! - Gem Block Puzzle

A cute crystal-themed Block Blast game. Single `index.html`, zero dependencies,
no build step. Ready for Vercel and Telegram Mini Apps.

## What's inside

| File | Purpose |
|------|---------|
| `index.html` | The entire game (HTML + CSS + JS inline) |
| `vercel.json` | Security headers + cache rules |
| `package.json` | Project meta + `npm run deploy` shortcut |

## Deploy to Vercel

### Option A - Vercel CLI (fastest)

```bash
npm i -g vercel
cd crystal-pop
vercel login
vercel --prod
```

- Framework Preset: **Other** (auto-detected, no build settings needed)
- When asked "In which directory is your code?" press Enter (project root)

### Option B - GitHub + Vercel Dashboard

1. Push this folder to a GitHub repository
2. Go to https://vercel.com/new and import the repo
3. Framework Preset: **Other** -> click **Deploy**

### Option C - CI / token based

```bash
npx vercel --prod --token=YOUR_VERCEL_TOKEN
```

To push updates later: edit `index.html`, then run `vercel --prod` again.

## Add to Telegram (Mini App)

1. Open **@BotFather** in Telegram -> send `/newapp`
2. Choose your bot, upload a 640x360 cover image, write description (GIF optional)
3. Paste your Vercel URL, e.g. `https://crystal-pop.vercel.app`
4. Telegram Mini Apps require HTTPS - Vercel provides it automatically

Alternative: `/mybots` -> **Bot Settings** -> **Menu Button** -> **Send URL**.

## Local preview

Just open `index.html` in a browser, or:

```bash
npx serve .
```

## Features

- 8x8 gem board, drag & drop (touch + mouse), 30+ weighted block shapes
- Row / column clearing with combos, score, and best-score saving
- 6 pastel crystal worlds (Rose Quartz, Amethyst, Aquamarine, Citrine, Mint, Opal Night)
  that rotate on every clear, with smooth background crossfade
- Particle bursts (shards, sparkles), gem shatter, line flash, combo banners, screen shake
- WebAudio synth sounds with mute toggle - no audio files needed
- Telegram WebApp integration: fullscreen, haptic feedback, header color sync
- Pure CSS crystal art: gradient facets, gloss highlights, twinkling sparkles - no emojis anywhere
