# Aditi's Playhouse

A single-screen, offline tap-and-play PWA for a 3-year-old.

Tap a big friendly animal → it wiggles, pops, sparkles, and says its name.
Three gentle mini-games. No reading, no timers, no scores, no fail states,
no ads, no analytics, no third-party scripts, no network calls at all.

Installs to a phone home screen and runs fullscreen, offline.

---

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev -- --host  # also reachable from a phone on the same wifi
```

```bash
npm run build
npm run preview        # http://localhost:4173 — the real service worker
```

The service worker only runs in a production build (`devOptions.enabled` is
`false`), so test offline behaviour against `preview`, never `dev`.

## What's in it

| Screen | |
|---|---|
| **Splash** | "Tap to start". Exists so audio can unlock — mobile browsers block sound until the first gesture. |
| **Farm** | Six animals. A tap fires a pop, a haptic buzz, a squash-and-bounce, a sparkle burst, and speaks the name. |
| **Colors** | "Tap something red." Wrong taps get a wobble and a soft neutral blip — never an error sound. |
| **Pop** | Shapes drift slowly upward; tap to pop. No goal, endless. |
| **Music** | Copy-the-tune on four pentatonic pads. A mistake just replays the tune. |
| **Settings** | Behind the parent gate. |

## Design rules

The full set is in `PLAN.md` Section 2. The ones that shape the code most:

- **Minimum 88 px touch targets.** Enforced via `--tap-min`; the smallest
  actual target in the app is 173 px.
- **No dead taps.** Every handler is on `onPointerDown`, not `onClick` — a
  click waits for the finger to *lift*, which on a slow device is 100-300 ms
  of nothing after the child has already touched the screen.
- **No fail states.** No timer, no score, no losing, no error sound anywhere.
- **Parent gate** in front of anything leaving the play area: hold for 3
  seconds, *then* an arithmetic question with the numbers spelled out
  ("What is three plus six?"). A pre-reader cannot pass it however well they tap.
- **Locked down.** No pinch-zoom, double-tap-zoom, pull-to-refresh, overscroll
  bounce, long-press menu, or text selection. Screen kept awake.

## Architecture notes

- **No router.** A `{ screen, payload }` state machine in `App.jsx`. History
  entries mean a back button, and a back button means a way out of the play area.
- **Sound effects are synthesised** with Web Audio oscillators, not audio
  files — nothing to license, nothing that can be missing from the offline
  precache, a few hundred bytes instead of a few hundred KB.
  `audioManager.playSfx("pop")` would call a recording just the same.
- **Speech** is `speechSynthesis`, cancelled on each new utterance so a fast
  tapper doesn't build a backlog. Handles iOS's async voice list.
- **Content is data.** `src/data/farm.js` defines the animals; swapping emoji
  for SVG art, or adding a Zoo scene, touches data and nothing else.
- Every optional API (wake lock, vibrate, speech, service worker) fails
  silently where unsupported.

## Renaming the app

`APP_NAME` / `APP_SHORT` live in `src/appInfo.js`, **and** the manifest name
lives in `vite.config.js`. Both must change — the manifest is generated at
build time and can't import from `src`.

## Deploy

Static site, no backend. Vercel/Netlify build with `npm run build` and serve
`dist/`. `vercel.json` sets the cache headers that matter: `sw.js` must be
revalidated on every request, or a browser can pin itself to an old version of
the app forever.

HTTPS is required — service workers, wake lock, and home-screen install do not
work over plain HTTP (localhost is exempt for development).

## Status

Phases 0-7 of `PLAN.md` complete; see `PROGRESS.md` for detail and known gaps.
# toddler-play
