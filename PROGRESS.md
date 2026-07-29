# PROGRESS

Session starter: **"Read `PLAN.md` and `PROGRESS.md`. We have completed through Phase N.
Do Phase N+1 exactly as specified, following the design rules in Section 2. When done,
run `npm run dev`, confirm no build errors, tell me what to test, and update `PROGRESS.md`."**

## Phases

- [x] **Phase 0 — Project setup & lockdown** _(2026-07-29)_
- [x] **Phase 1 — Core tap-to-discover Farm scene** _(2026-07-29)_
- [x] **Phase 2 — Audio system + juice** _(2026-07-29)_
- [x] **Phase 3 — Splash, Home & Parent Gate** _(2026-07-29)_
- [x] **Phase 4 — Mini-game: Find the Color** _(2026-07-29)_
- [x] **Phase 5 — Mini-game: Shape Pop** _(2026-07-29)_
- [x] **Phase 6 — Mini-game: Copy the Tune** _(2026-07-29)_
- [x] **Phase 7 — PWA: offline + installable + fullscreen** _(2026-07-29)_
- [ ] **Phase 8 — Polish, safety pass & deploy** ← next

**v1 is playable and installable.** Phase 8 is the audit-and-ship pass.

---

## Environment note

Node was not installed on this machine. Node **24.18.0 LTS** was installed
user-locally to `~/.local/node` (checksum-verified from nodejs.org) and added to
`PATH` via `~/.bashrc`. Remove with `rm -rf ~/.local/node` plus the two `~/.bashrc`
lines. New terminals pick it up automatically; in an already-open one run
`export PATH="$HOME/.local/node/bin:$PATH"`.

---

## Decisions that changed the plan

**Sound effects are synthesised, not files.** PLAN.md Section 4 assumed
downloaded `.mp3`s from Kenney/Mixkit. `audioManager.js` builds every sound from
Web Audio oscillators instead: no assets to source, no licences to track,
nothing that can be missing from the offline precache, and a few hundred bytes
instead of a few hundred KB. `playSfx("pop")` is the same call either way, so
real recordings can be dropped in later without touching a component.
`src/assets/audio/` is therefore still empty, by choice.

**The parent gate is two stages, not one.** PLAN.md offered hold-3s **or** word
math. Both are used in series, because either alone is weak here — a 3-year-old
rests a finger on the screen for three seconds constantly, and six choices means
1-in-6 odds for a hand mashing the screen. The real lock is that the numbers are
spelled out ("What is three plus six?"): a pre-reader cannot parse it however
well they tap. Auto-dismisses after 12 s idle.

**Taps are bound to `onPointerDown`, never `onClick`.** A click waits for the
finger to lift — 100-300 ms of nothing on a slow device after the child has
already touched the screen, which reads as a dead tap (Section 2 rule 2). Every
interactive element also calls `preventDefault()` on the synthetic click so a
desktop mouse doesn't fire everything twice.

**No `<audio>` elements and no asset requests at runtime**, so "fully offline"
is structural rather than something the service worker has to get right.

---

## Built

**Audio** — `src/audio/audioManager.js`
`unlock()` (resume context + silent blip + prime `speechSynthesis`, called from
the splash gesture), `playSfx()` (`pop` / `chime` / `celebrate` / `soft` /
`woosh`), `playNote()`, `speak()` (cancels in-progress speech so a fast tapper
doesn't build a backlog), `stopSpeech()`, `vibrate()`, `setMuted()`.
Handles async voice loading via `voiceschanged` (iOS returns an empty list on
first read). Every entry point is try/caught — silence is an acceptable failure,
a crash is not. Nothing sounds before `unlock()`.

**Farm scene** — `data/farm.js`, `Character.jsx`, `Scene.jsx`, `Sparkles.jsx`
Six animals as data. A tap fires pop SFX → haptic → squash-and-bounce → sparkle
burst → "Cow. Moo." Speech is throttled to 600 ms but the *visual and the pop
are not*, so drumming on the screen never produces a dead tap. Fixed 2×3
portrait / 3×2 landscape grid — deliberately not `auto-fit`, because a tile
count that changes with the viewport can overflow, and this app never scrolls.

**Navigation** — `Splash.jsx`, `Home.jsx`, `HomeButton.jsx`, `ParentGate.jsx`,
`Settings.jsx`, `useWakeLock.js`
Whole-screen splash (a 3-year-old shouldn't have to aim). Four picture tiles.
The Home button is *not* gated — going home stays inside the play area; only
leaving it is gated.

**Find the Color** — target shown as a giant animated swatch *and* spoken, so it
works with the sound off. Correct: glow, chime, praise, new round. Wrong: a
wobble and a quiet neutral blip, then the prompt repeats. No score, no timer, no
losing.

**Shape Pop** — circles/squares/triangles/stars drift up at 60-90 px/s. Tap
pops with a burst; untouched shapes recycle silently off the top. The opening
batch is spread across the screen so it's never empty.

**Copy the Tune** — four pentatonic pads (any tap order sounds pleasant,
including all four at once). Wrong tap replays the same sequence — never a
"game over". Sequence grows to 5 then restarts fresh. Tapping during playback
still lights and sounds the pad; it just doesn't count.

**PWA** — `vite.config.js` + `main.jsx`
Named **"Aditi's Playhouse"**, `short_name` **"Aditi"** (what shows under the
home screen icon; iOS and Android both truncate around 12 characters).
`display: fullscreen` with `display_override` fallback chain, `orientation:
portrait`. Service worker precaches all 16 build outputs and auto-updates with
no reload prompt (meaningless to this audience, and must never cover the play
area).

**Icons** — built from the supplied artwork at `/home/acer/Project/1000864942.png`
(1254x1254). Two things had to be handled:
- The source is **RGB with no alpha**, so the area outside the rounded frame is
  *solid black*, not transparent — shipped as-is a home screen would show a
  black tile. The surround is flood-filled from the image border rather than
  assuming a corner radius, so it follows the real frame shape exactly.
- The **maskable** variant must be opaque and full-bleed (Android crops it to a
  circle of 80% diameter). The art is inset to 80% and the gap filled with
  `#f6d216`, sampled from the icon's own yellow frame — so the crop never cuts
  into her face and there is no seam.

`theme_color` / `background_color` are that same `#f6d216`, which makes the PWA
launch splash (background + centred 512 icon) seamless.

**In-app branding** — `components/Brand.jsx`, `appInfo.js`
The manifest name/icon are only visible on the home screen, so the badge is
also shown *inside* the app, in three variants: `full` (splash hero),
`bar` (Home header), `mini` (compact badge on scenes and games).

Two things make it safe for this audience:
- **`pointer-events: none`.** A toddler taps corners constantly; a branding
  element that could absorb a tap would be a dead spot. Verified with
  `elementFromPoint` at the badge centre on every screen — the tap lands on the
  play grid underneath, never on the badge.
- **`--brand-gutter`** reserves a top strip on each play grid so the badge
  doesn't sit over an animal. It has to cover the badge's top offset *and* its
  height; sized at only the height it clipped the first row by 2 px.

The icon is imported through Vite from `src/assets/art/` rather than referenced
as a bare `/icons/…` path, so it gets hashed, precached, and survives a change
of `base` (e.g. for GitHub Pages). The 96 px in-app copy is 7 KB.

`appInfo.js` holds `APP_NAME` / `APP_SHORT`. Renaming means editing that file
**and** `vite.config.js` — the manifest is generated at build time and can't
import from `src`.

All icons are palette-quantised to 256 colours: 464 KB → 73 KB for the 512,
and the total precache dropped from 1277 KB back to 518 KB with no visible
quality loss. Worth it on the cheap phone this targets.

---

## Verified

Driven with headless Chrome at 390×844 and 844×390:

- All four screens + both overlays render; **zero console errors, zero page errors**.
- **Zero external network requests** — every request is same-origin.
- Touch targets: home tiles 177×404, farm 182×256, colour tiles 170×356,
  music pads 173×173. Minimum is 173 px against an 88 px rule.
- Corner buttons overlap **no** play tile in either orientation.
- Shape Pop shapes rise ~180-240 px in 3 s and all six stay on screen.
- Parent gate: 1.2 s hold does not advance; 3 s does; a wrong answer re-asks and
  does not leak Settings; a correct answer opens it.
- Offline: after one online load, `setOfflineMode(true)` + reload still boots the
  splash, reaches the Farm, and animates a tap. 10 cache entries.
- All five icons fetch 200, decode, and report their declared dimensions;
  `document.title` is "Aditi's Playhouse", apple web-app title is "Aditi".
- Brand badge present on all six screens in both orientations, image decoded,
  `pointer-events: none` confirmed, and overlapping **zero** tappable elements.
- Portrait and landscape both fit with no page scroll.

---

## Bugs found and fixed during the build

- **Shape Pop shapes teleported to the top instantly.** They animated the CSS
  `bottom` property from `-30vmin` to `115vh` — interpolating between *different
  units* is undefined, so it snapped to the end. Now animates a pixel `y`
  transform (also cheaper: stays on the compositor). On pop, `controls.stop()`
  freezes `y` in place so the burst happens where the child actually touched.
- **Emoji were sized in `vmin`**, so they looked right in portrait and shrank in
  landscape. Now sized in `cqmin` against their own tile, with a `vmin` clamp
  behind `@supports` for engines without container queries. Farm emoji went from
  ~58 px to ~103 px.
- **Corner buttons sat on top of play tiles** (Home over the horse, the gear over
  the Colors tile). Added a `--corner-gutter` reserved by each play grid —
  bottom in portrait, sides in landscape where width is plentiful.
- **The brand badge clipped the first farm tile by ~2 px.** `--brand-gutter` was
  sized to the badge's height but not its 8 px top offset. Also dropped the
  landscape override that let the badge share the top strip with row one.

---

## Known / deferred

- `npm audit` reports a high-severity `brace-expansion` advisory reached only via
  `vite-plugin-pwa → workbox-build → ejs → jake → filelist`. **Build-time only,
  never shipped to the browser**; the fix is a breaking downgrade. Left as-is.
- Not yet tested on a real phone. Headless Chrome does not reproduce iOS/Android
  gesture handling, real TTS voices, or actual audio-unlock behaviour — **this is
  the main gap before Phase 8.**
- `src/assets/art/` is empty; emoji are the art. Swapping in SVG is a change to
  `data/farm.js` only.
- Not deployed. Phase 8 covers Vercel/Netlify + installing to the device.
