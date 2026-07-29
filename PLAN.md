# Toddler Tap-to-Play Web App — End-to-End Build Plan

A build plan written to be executed with **Claude Code in VS Code**. Work through it one phase at a time. Each phase has a **Goal**, a **What to build** list, and a **ready-to-paste prompt** for Claude Code.

Keep this file (`PLAN.md`) and a `PROGRESS.md` in the repo root, and tell Claude Code to read both at the start of every session.

---

## 1. What you're building

A single-screen, offline **Progressive Web App (PWA)** for a 3-year-old:

- **Core loop:** tap a big friendly character → it wiggles, plays a sound, and says its name aloud.
- **Themes:** a Farm scene to start (Zoo / Underwater later — same engine, different assets).
- **Mini-games:** Find-the-color, Shape-pop, Copy-the-tune (memory). All gentle, no losing.
- **No reading, no timers, no fail states, no ads, no data collection, no external links.**
- **Parent gate** in front of anything a child shouldn't reach (settings, exit).
- Installs to the home screen and runs fullscreen, offline (works on a plane).

---

## 2. Non-negotiable design rules (paste these into every prompt)

These are the rules that make an app *toddler-safe and toddler-friendly*. Thread them into every feature.

1. **Huge touch targets.** Minimum 88×88 px, ideally bigger. Space them apart so a mis-tap is harmless.
2. **Every tap does something within ~50 ms.** Never a dead tap. Instant visual + audio feedback.
3. **No fail states, no timers, no scores, no "wrong" buzzer.** A wrong tap gently does nothing or re-prompts.
4. **No small menus, no text the child must read.** Navigation is pictures and big icons.
5. **Parent gate** (hold-to-continue for 3 s, or a word-based math question like "tap the number that is three plus four") before settings, exit, or any link. A toddler must not be able to leave the play area.
6. **Fully offline. Zero network calls. No ads, no analytics, no third-party scripts, no purchases.**
7. **Lock the experience down:** disable pull-to-refresh, overscroll bounce, double-tap zoom, long-press context menu, and text selection. Lock orientation. Keep the screen awake.
8. **Audio must unlock on first user gesture** (mobile browsers block autoplay) — handled by a "Tap to start" splash.
9. **Runs smoothly on a cheap/old phone.** Prefer transforms and lightweight animation; avoid heavy assets.

---

## 3. Tech stack

- **Vite + React** (JavaScript — fastest for a fun project; switch to TypeScript if you prefer).
- **Framer Motion** for juicy animations (bounce, squash, particles). *Alternative:* plain CSS transforms if you want zero deps and max performance.
- **Web Speech API (`speechSynthesis`)** to speak names and prompts — **no voice recordings needed** for v1.
- **HTML5 `Audio`** (or Web Audio) for sound effects (pops, chimes).
- **`vite-plugin-pwa`** for offline caching + installability.
- **No backend. No router library needed** — a simple screen-state state machine is enough.

---

## 4. Asset strategy (this is how you ship fast)

The hardest part of a kids' app is usually art and audio. Sidestep it:

- **Start with emoji as the characters.** 🐄 🐖 🐑 🐔 🐴 🐸 are giant, colorful, and free. Ship the whole engine on emoji, then swap in custom art later without touching logic.
- **Use `speechSynthesis` for all spoken words** ("cow", "red", "great job"). No recordings, works cross-platform, free. *(Caveat: iOS voices load asynchronously and quality varies — fine for v1; recorded voice is the polish upgrade.)*
- **Sound effects:** grab a few free pops/chimes from **Kenney.nl**, **Mixkit**, or **Freesound** (check licenses). Keep them tiny (`.mp3` or `.ogg`).
- **Upgrade path (later):** replace emoji with **SVG** characters (crisp at any size, tiny files) or WebP, and replace TTS with recorded voice. Because everything is data-driven, this is a config change, not a rewrite.

Put assets in `src/assets/audio/` and `src/assets/art/`. Define characters as data (see structure below) so art and sound are just fields.

---

## 5. Folder structure

```
toddler-play/
├─ PLAN.md
├─ PROGRESS.md
├─ index.html
├─ vite.config.js
├─ public/
│  ├─ icons/            (PWA icons: 192, 512, maskable)
│  └─ manifest.webmanifest
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx           (screen state machine: splash → home → scene → game)
│  ├─ data/
│  │  └─ farm.js        (characters: {id, label, emoji/art, sound, color, shape})
│  ├─ audio/
│  │  └─ audioManager.js (unlock, playSfx, speak)
│  ├─ components/
│  │  ├─ Splash.jsx      (Tap to start — unlocks audio)
│  │  ├─ Home.jsx        (pick scene / game — big picture buttons)
│  │  ├─ ParentGate.jsx  (hold-to-continue or word math)
│  │  ├─ Character.jsx   (one tappable animal with animation)
│  │  └─ Scene.jsx       (renders characters for a theme)
│  ├─ games/
│  │  ├─ FindColor.jsx
│  │  ├─ ShapePop.jsx
│  │  └─ CopyTune.jsx
│  ├─ hooks/
│  │  ├─ useWakeLock.js  (keep screen awake)
│  │  └─ useNoGestures.js(block zoom/overscroll/context menu)
│  └─ styles/
│     └─ global.css
```

---

## 6. How to work with Claude Code (workflow that keeps quality high)

- **One phase per session.** Paste the phase prompt, let it build, verify, then commit. Don't run ahead.
- **Have it run the app.** End prompts with *"run `npm run dev`, confirm it builds with no errors, and tell me what to check in the browser."*
- **Keep `PROGRESS.md` updated.** Start each session with: *"Read PLAN.md and PROGRESS.md. We finished Phase N. Do Phase N+1. Update PROGRESS.md when done."*
- **Commit after every phase** with a clear message (`git commit -m "Phase 2: audio + juice"`). Easy to roll back.
- **Test on the real device early** — ideally your daughter's actual phone/tablet — from Phase 3 onward. Toddlers find edge cases adults never will.
- **Keep the design rules in context.** If a build drifts (tiny buttons, a fail sound), point Claude back to Section 2.

---

## 7. The phased plan

### Phase 0 — Project setup & lockdown

**Goal:** A running Vite + React app that behaves like a locked-down kiosk, not a web page.

**What to build:** Vite scaffold, dependencies, global CSS reset, gesture-blocking (no zoom/overscroll/context menu/selection), the screen-state machine skeleton in `App.jsx` (`splash | home | scene | game`), and a `PROGRESS.md`.

> **Prompt for Claude Code:**
> Scaffold a new Vite + React (JavaScript) project called `toddler-play` for a touch app aimed at a 3-year-old. Install `framer-motion` and `vite-plugin-pwa`.
> Set up the folder structure exactly as in PLAN.md Section 5 (create empty/stub files where a phase will fill them later).
> In `App.jsx`, implement a simple screen-state machine with states `splash`, `home`, `scene`, `game` and a function to switch between them — render placeholder text for each state for now.
> Add `src/hooks/useNoGestures.js` and apply it globally so the app disables: double-tap-to-zoom, pinch-zoom, pull-to-refresh, overscroll bounce, long-press context menu, and text selection. Also set the viewport meta tag to prevent user scaling and set `overflow: hidden` with a full-viewport root.
> Add `src/styles/global.css` with a CSS reset, a big kid-friendly base (large font, high-contrast, `touch-action: manipulation`), and a full-screen root container.
> Create `PROGRESS.md` listing the phases from PLAN.md with Phase 0 marked done.
> Run `npm run dev`, confirm it builds with no errors, and tell me exactly what I should see and test in the browser.

---

### Phase 1 — Core tap-to-discover scene (the heart of the app)

**Goal:** A Farm scene where tapping any animal makes it animate, play a sound, and say its name.

**What to build:** `data/farm.js` (data-driven characters), `Character.jsx` (big animated emoji button), `Scene.jsx` (lays out the farm), TTS wired up so tapping speaks the label. Use emoji for now.

> **Prompt for Claude Code:**
> Read PLAN.md Sections 2 and 4. Build the core tap-to-discover Farm scene.
> Create `src/data/farm.js` exporting an array of characters. Each: `{ id, label, emoji, color, shape }` — include cow 🐄 (moo), pig 🐖 (oink), sheep 🐑 (baa), chicken 🐔 (cluck), horse 🐴 (neigh), duck 🦆 (quack). Add a `soundText` field with the animal sound word for now (we'll add real audio files in Phase 2).
> Create `src/components/Character.jsx`: renders one character as a very large tappable button (min 120px, huge emoji). On tap it should (a) play a squash-and-bounce Framer Motion animation, and (b) speak the label using `speechSynthesis` (e.g. "Cow"). No dead taps — feedback must be instant.
> Create `src/components/Scene.jsx`: takes a data array and lays the characters out in a friendly grid that fits the viewport with generous spacing (mis-taps must be harmless). Give it a warm farm-colored background.
> Wire the `scene` screen state in `App.jsx` to render the Farm scene.
> Follow every rule in PLAN.md Section 2 (big targets, instant feedback, no fail states, no reading).
> Run the app and tell me what to test.

---

### Phase 2 — Audio system + "juice"

**Goal:** A proper audio manager (sound effects + speech) that unlocks correctly on mobile, plus satisfying particle/animation feedback.

**What to build:** `audio/audioManager.js` (unlock on first gesture, `playSfx`, `speak` with a queue so sounds don't overlap badly), real SFX for taps, sparkle/particle burst on tap, optional haptics via `navigator.vibrate`.

> **Prompt for Claude Code:**
> Read PLAN.md Section 4. Build a central audio system and add juice.
> Create `src/audio/audioManager.js` with: an `unlock()` function to call on the first user gesture (resume/prime the audio context and warm up `speechSynthesis`); `playSfx(name)` for short sound effects preloaded from `src/assets/audio/`; and `speak(text)` using `speechSynthesis` that cancels any in-progress utterance so words don't pile up. Handle the case where a voice list loads asynchronously (iOS).
> I'll drop a few small `.mp3` sound effects into `src/assets/audio/` (a "pop" and a "chime"). Reference them by name and fail gracefully if a file is missing.
> Update `Character.jsx` so a tap plays the pop SFX, speaks the name, triggers a short particle/sparkle burst around the character (Framer Motion), and fires `navigator.vibrate(30)` if available.
> Make sure nothing tries to play audio before `unlock()` has run.
> Run the app and tell me how to verify audio unlock works and what a tap should now feel like.

---

### Phase 3 — Splash, Home screen & Parent Gate

**Goal:** A first-tap splash that unlocks audio, a picture-based Home to choose scene/game, and a parent gate protecting anything a child shouldn't reach.

**What to build:** `Splash.jsx` ("Tap to start" → calls `unlock()` → Home), `Home.jsx` (big picture buttons for Farm + each game, no text-only nav), `ParentGate.jsx` (hold-for-3-seconds OR a word-based math question), `useWakeLock` hook to keep the screen awake.

> **Prompt for Claude Code:**
> Read PLAN.md Sections 2 and 6. Build navigation and the parent gate.
> Create `src/components/Splash.jsx`: a friendly full-screen "Tap to start" screen. The first tap calls `audioManager.unlock()` then moves to the Home screen. This satisfies the mobile audio-unlock requirement.
> Create `src/components/Home.jsx`: large picture buttons to launch the Farm scene and each mini-game (use emoji/icons, minimal text). Include a small, corner-placed settings/exit button that is protected by the parent gate.
> Create `src/components/ParentGate.jsx`: blocks children from settings/exit. Implement it as "press and hold the button for 3 seconds" with a filling progress ring, OR a question written in words ("Tap the answer to three plus four") with number choices. It must not be solvable by random tapping. On success, allow the protected action; on the child wandering off, auto-dismiss.
> Add `src/hooks/useWakeLock.js` using the Screen Wake Lock API to keep the screen awake while the app is active, re-acquiring on visibility change, failing silently where unsupported. Use it in `App.jsx`.
> Wire the full flow: Splash → Home → (Scene or Game), with the parent gate in front of settings/exit.
> Run the app and tell me how to test the flow and the gate.

---

### Phase 4 — Mini-game: Find the Color

**Goal:** A gentle "tap something red" game with no losing.

**What to build:** `games/FindColor.jsx` — voice prompts a color, characters/shapes appear, tapping the right color glows + celebrates, wrong taps gently do nothing (or a soft "try again" shimmer). New round auto-starts. Endless, no score.

> **Prompt for Claude Code:**
> Read PLAN.md Section 2. Build the Find-the-Color mini-game at `src/games/FindColor.jsx`.
> On each round, `speak` a color prompt (e.g. "Tap something red") and show several large colored shapes/characters, at least one matching. Tapping a match: it glows/bounces, play the chime SFX, `speak` praise ("Yes! Red!"), then start a new round after a short beat. Tapping a non-match: gentle shimmer, NO error sound, NO penalty — the child can keep trying.
> Absolutely no timer, no score, no losing. Endless rounds. Big targets, generous spacing.
> Add it to Home and the `game` screen state. Run the app and tell me what to test.

---

### Phase 5 — Mini-game: Shape Pop

**Goal:** Big shapes drift slowly across the screen; tapping pops them with a happy sound.

**What to build:** `games/ShapePop.jsx` — a few large shapes gently float; a tap pops one (particle burst + pop SFX + optional shape/color name spoken). New shapes keep spawning. Pure sensory play, no goals.

> **Prompt for Claude Code:**
> Build the Shape-Pop mini-game at `src/games/ShapePop.jsx`, following PLAN.md Section 2.
> Spawn a few large, colorful shapes (circle, square, triangle, star) that drift slowly across the screen using Framer Motion. Tapping a shape pops it: particle burst, pop SFX, optional `speak` of the shape or color name. Shapes respawn continuously so the screen is never empty.
> Keep movement slow and predictable (easy for a toddler to hit). No goals, no timer, no score, no failing. Add it to Home and the game state. Run the app and tell me what to test.

---

### Phase 6 — Mini-game: Copy the Tune (simple memory)

**Goal:** Three characters light up in sequence; the child taps them back. Very forgiving.

**What to build:** `games/CopyTune.jsx` — a short sequence (start at length 2–3) plays with light + sound; child repeats; correct → celebrate and gently grow the sequence; mistakes → simply replay the sequence, never a "game over".

> **Prompt for Claude Code:**
> Build the Copy-the-Tune memory game at `src/games/CopyTune.jsx`, following PLAN.md Section 2.
> Show 3–4 big character pads. Play a short sequence (start at length 2) where each pad lights up and plays a distinct tone/sound. Then let the child repeat it by tapping. Correct repeat: celebrate (chime + praise + sparkle) and optionally add one step. A mistake is NOT a loss — just gently replay the same sequence and let them try again. No score, no timer, no "game over" ever.
> Keep tap targets large and sequences short and slow. Add it to Home and the game state. Run the app and tell me what to test.

---

### Phase 7 — PWA: offline + installable + fullscreen

**Goal:** The app installs to the home screen, launches fullscreen (no browser chrome), and works with no network.

**What to build:** Configure `vite-plugin-pwa` (manifest with name, theme color, `display: fullscreen`/`standalone`, orientation lock, icons), a service worker that precaches all app assets, and verify offline behavior.

> **Prompt for Claude Code:**
> Read PLAN.md Section 1. Turn this into an installable, offline PWA using `vite-plugin-pwa`.
> Configure `vite.config.js` with the PWA plugin: a `manifest.webmanifest` (app name, short name, `theme_color`, `background_color`, `display: "fullscreen"` with `standalone` fallback, `orientation` locked to landscape or portrait — recommend one and explain, and icons at 192/512 plus a maskable icon). I will add the icon PNGs under `public/icons/`.
> Set the service worker to precache all JS/CSS and the audio/art assets so the app runs fully offline with no network requests. Register it with auto-update.
> Confirm the build produces a valid manifest and service worker. Then tell me exactly how to (a) build and preview the production PWA, (b) verify it works offline in DevTools, and (c) install it to a phone home screen.

---

### Phase 8 — Polish, safety pass & deploy

**Goal:** Ship it, and make it robust to a toddler's chaos.

**What to build:** A safety/UX audit against Section 2, graceful handling of missing assets/unsupported APIs, an app icon and splash, and deployment to a static host.

> **Prompt for Claude Code:**
> Do a final polish and safety pass, checking the whole app against PLAN.md Section 2 and reporting anything that violates it (small targets, dead taps, any fail sound/timer/score, missing parent gate, any network call, zoom/overscroll not blocked). Fix what you find.
> Make every API optional and fail silently where unsupported (wake lock, vibrate, speech). Ensure no uncaught errors if an audio file or voice is missing.
> Then give me a step-by-step to deploy this static PWA to Vercel (or Netlify / GitHub Pages), and how to open it on my daughter's device and install it.

---

## 8. Deployment (quick reference)

It's a static site, so hosting is trivial and free:

- **Vercel / Netlify:** connect the Git repo → it runs `npm run build` → serves `dist/`. Zero config. Gives an HTTPS URL (required for PWA install and several APIs).
- **GitHub Pages:** push `dist/` (set `base` in `vite.config.js` to your repo name).
- Open the HTTPS URL on the phone → browser menu → **Add to Home Screen** → it launches fullscreen and works offline.

HTTPS matters: service workers, wake lock, and installability only work over HTTPS (localhost is exempt for dev).

---

## 9. Toddler test checklist (do this on the real device)

- [ ] First tap starts audio; sounds actually play on the phone.
- [ ] Every character/shape responds instantly to a tap — no dead spots.
- [ ] No pinch-zoom, no double-tap-zoom, no pull-to-refresh, no long-press menu, no text selection.
- [ ] Mashing the screen with a whole palm doesn't break anything or navigate away.
- [ ] The child cannot exit the play area or reach settings without the parent gate.
- [ ] There is no timer, no score, no "wrong" sound anywhere.
- [ ] Screen doesn't dim/sleep during play.
- [ ] Works with the phone in airplane mode (fully offline).
- [ ] Runs smoothly — no lag on the actual (possibly old) device.

---

## 10. Stretch ideas (after v1 ships)

- **Custom SVG art + recorded voice** (your own voice saying the names is magical for a toddler).
- **More scenes** (Zoo, Ocean, Vehicles) — just new data files + assets, same engine.
- **A "photo peekaboo"** with family photos behind tappable doors (all local, no upload).
- **Simple letter/number discovery** scene once she's ready.
- **A grown-up-only settings panel** (behind the gate) to toggle sound, pick voice, choose scene.

---

### Session starter you can reuse

> Read `PLAN.md` and `PROGRESS.md`. We have completed through Phase N. Do **Phase N+1** exactly as specified, following the design rules in Section 2. When done, run `npm run dev`, confirm no build errors, tell me what to test, and update `PROGRESS.md`.
