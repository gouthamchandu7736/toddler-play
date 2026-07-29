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

---

## Content expansion (2026-07-29)

Grew from 4 activities to **12**, all reachable from one non-scrolling menu.

**New scenes** — `data/scenes.js` (replaces `data/farm.js`)
Animals, Birds, Vehicles, Fruits, Shapes. Pure data: no new components, no new
screen state. `Scene.jsx` and `Character.jsx` were untouched, which is what the
data-driven design in PLAN.md Section 4 was for.

**Learn Letters** — `games/LearnLetters.jsx`, `data/letters.js`
A-Z flashcards. Says the letter *alone first*, pauses, then "A is for Apple" —
run together as one phrase a 3-year-old hears only "aysforapple". Shows
uppercase and lowercase together; children meet lowercase far more often in
real books, yet most alphabet toys teach capitals only. Navigation wraps in
both directions, so there is no first or last card to get stuck on and no
disabled button (a disabled control is a dead tap).

Words are concrete nouns she already knows, and every emoji predates Unicode 14
— newer ones render as an empty box on older Android, and a blank card is worse
than a duller word. X uses "Box": no toddler-familiar word starts with X, and
this at least teaches the /ks/ sound with a picture that always renders.

**Learn Numbers** — `games/LearnNumbers.jsx`, `data/numbers.js`
1-10. The teaching point is **one-to-one correspondence**, not reciting number
names — most 3-year-olds can chant "one two three" long before it means
anything. So each object lights up, plays a rising note and is named as it is
counted, and tapping an individual object names its position so she can count
at her own pace.

**Find it** — `games/FindIt.jsx`
"Where is the cow?" Choices are drawn from **one category per round** — mixing
a lion in with three lorries makes the answer findable by elimination without
knowing any of the words. This is the one activity that genuinely needs sound,
so the replay button is full-size and central rather than a corner icon.

**Deck** — `components/Deck.jsx`
Shared chrome for the two flashcard games. Prev/next run the full height of
each screen edge, which is both an enormous target and clear of the Home and
replay buttons that a toddler hits constantly by accident.

### Layout changes

- `home-grid` and `scene-grid` switched to **`grid-auto-rows: 1fr`** with a
  fixed column count. Rows are created as needed and share the container height,
  so the menu can grow to any number of activities and a scene can hold 6 or 8
  characters — without ever overflowing. This app never scrolls, so a menu that
  grew in height or added pages would be a bug.
- 12 tiles fill a clean 3x4 (portrait) / 5x3 (landscape) with no ragged row.

### Bugs found and fixed in this pass

- **Deck arrows overlapped the card by 37 px each side.** `.tappable` sets
  `min-width: 88px`, which silently overrode the arrows' `width`. Reset
  `min-width` and moved the width into `--deck-arrow-w`, shared by the arrow and
  the stage padding so they can't drift apart again. The card went from 198 px
  to 266 px wide. The 56 px arrow is a **deliberate exception** to the 88 px
  rule: the target is ~660 px tall, so it is far easier to hit than any 88x88
  button, and the rule exists to guarantee a finger lands.
- **Counting objects shrank to 43 px on a 320 px screen** — unhittable. They
  were in a fixed-column grid dividing whatever width the arrows left over.
  Switched to flex-wrap: every object holds >=56 px and a row is added when
  width runs out. Now a consistent 64 px on every viewport tested.
- **Flashcards filled the full screen height** regardless of content, so "one
  apple" was a huge empty rectangle. Cards now size to their content
  (`height: auto`). This forced `container-type` from `size` to `inline-size` —
  `size` requires a definite height, which would have pulled `height: 100%`
  straight back — so the type scale is driven by card width (`cqi`) and capped
  in `vh` so a short screen still can't overflow.

### Verified

At 390x844, 844x390 **and** 320x568:

- All 12 activities open, render and return home. **No console errors.**
- Nothing scrolls vertically or horizontally on any screen at any size.
- Every primary control >= 88 px. The two documented exceptions are the deck
  arrows (56 px wide x 400-676 px tall) and the number counters (64 px).
- Letters wrap A -> B -> ... -> Z going backwards from A.
- Numbers show exactly 1, 2, 3 objects on the first three cards and light them
  progressively during the count.
- Find it draws all four choices from a single category.
- Ten counters fit inside the card with zero overflow at 320 px wide.

---

## Design-system rebuild + 8 more activities (2026-07-29)

Full visual redesign against a brief asking for a "premium, modern, playful"
kids' platform. **20 activities**, six categories, one design system.

### Where the brief was adapted, and why

The brief describes a *website*. Several items assume a reader with a mouse:

- **"Hover effects"** — a tablet has no hover. Implemented as *pressed* states
  instead (`whileTap` + a solid shadow the button sinks into). Hover exists
  behind `@media (hover: hover)` for a grown-up on a desktop, but no state that
  carries meaning depends on it.
- **"Play button on each card"** — rendered, but `pointer-events: none`. The
  *whole card* is the target (~170px). A small button inside a big card teaches
  a child that only part of a thing is tappable, and every miss becomes a dead
  tap.
- **"Short description on each card"** — kept, written for the GROWN-UP. It
  never carries anything she needs; the emoji identifies the game and the title
  is spoken aloud when she touches the card.
- **"Search"** — not built. It needs typing and reading, and a pre-reader
  cannot use it. Categories + Favourites + Recently Played cover the same need
  ("get me to a game fast") without either.
- **"Hamburger menu / breadcrumbs"** — not built, same reason. Navigation is
  positional: Back is the same shape in the same corner on every screen, which
  becomes muscle memory rather than something to read.
- **Favourites** — built, and it is the one place a second target was accepted
  on a card. It earns it by being harmless: a mis-tap toggles a star, it does
  not navigate or take anything away. Full 88px hit area, small visual.

### Design system

- `styles/tokens.css` — colour, type scale, spacing, radius, shadow, motion.
  Nothing else hard-codes a hex, a radius or a duration.
- Palette is deliberately **mid-saturation**. Neon on a bright screen is
  fatiguing over a long session and leaves no headroom for reward moments to
  feel brighter than the UI. Shadows are tinted toward the ink colour — neutral
  black against pastel reads as dirt.
- **Fredoka, self-hosted**, 29 KB. A webfont link would break both the
  zero-network-calls rule and offline mode. It is the VARIABLE font: one file
  covers every weight, and Google's per-weight static files turned out to be
  byte-identical to it, so requesting five weights shipped the same 29 KB five
  times (164 KB → 29 KB).
- `ui/Icon.jsx` — hand-drawn inline SVG, one 24x24 box, one 2.4 stroke. Nothing
  to download, no dependency, uniform weight. **UI chrome only**: game identity
  stays emoji, because a 3-year-old recognises a full-colour 🐄 instantly and a
  two-tone line drawing of a cow not at all.
- `ui/Button.jsx` — every control in the app. One place defines size, radius,
  press feel and sound.
- `ui/PlayfulBackground.jsx` — gradient sky, drifting clouds, rising bubbles,
  twinkling stars, rolling hills. All CSS, transform/opacity only, so it stays
  on the compositor. Low-contrast and slow on purpose: a background that
  catches the eye pulls a toddler off the task.
- `ui/GameShell.jsx` — background + header + content area, declared once.
  Previously each game positioned its own floating Home button, which is how it
  twice ended up overlapping a play tile.

### Navigation

Home is six category doors, not a wall of 20 games: the app must never scroll,
and 20 tiles on one non-scrolling screen would be 20 tiles too small to hit.
Favourites and Recently Played rows keep her usual games one tap away, so the
grouping costs her nothing. Back from a game returns to its category, not home.

Favourites/recents live in `localStorage` via `hooks/useStoredList.js` — device
only, nothing transmitted, every access wrapped (localStorage throws in private
Safari and at quota).

### New activities (8)

Memory Match (3 pairs — a 4x4 board is not a harder version of this game for a
3-year-old, it is an unplayable one), Shadow Match (silhouettes via
`brightness(0)`, so the shadow matches the picture exactly), Peekaboo (2.5-4s
windows, not a reaction test), Catch the Stars (notes rise with a streak),
Colouring (tap-to-fill, NOT freehand — freehand needs `touchmove`, which is
globally cancelled so she cannot swipe out of the play area), Piano (pentatonic,
so no combination of keys can sound wrong), Nursery Rhymes (line-by-line, each
line lit as it is read), and a Vegetables scene.

### Bugs found and fixed in this pass

- **Colouring palette swatches were 18px** at 320px — eight in a fixed row.
  A fixed four still gave 43px. `auto-fit, minmax(56px, 1fr)` lets the column
  COUNT vary so the SIZE cannot. Now 60px+.
- **Piano keys were 28px wide** at 320px. Portrait now stacks them as
  full-width bars (xylophone); side-by-side returns at >=620px or landscape.
- **Rhyme cards were crushed to ~96px** by the side arrows on a 320px screen.
  Portrait drops the arrows to a row beneath the card.
- **Catch stars were 41px** at 320px; added a 62px floor.
- **Memory cards stretched into tall slivers** — the board now carries a 3:2
  aspect so the cards come out square.

### Verified

At **390x844, 844x390, 320x568 and 1280x800**:

- All 20 activities open, render and return; all six categories navigate.
- **Zero console errors. Zero external network requests.**
- Nothing scrolls in either axis on any screen at any size.
- Smallest control is 60px (colour swatch) / 64px (star) / 68px (chrome).
  Documented exceptions to the 88px rule: top-bar chrome 68px, deck arrows
  56px wide but several hundred tall, number counters 56px, colour swatches.
- Favourite star toggles `aria-pressed`, and both lists survive a reload.
- Fredoka reports `loaded` and is the computed body font.

### Not done from the brief

Alphabet tracing, sticker book, drum/xylophone as separate instruments, jigsaw,
shape sort, pattern matching, whack-a-mole as a scoring game, fishing, picture
match, card flip as a separate game, bedtime stories, interactive storybook.
Freehand drawing is blocked by the gesture lockdown (see Colouring). The rest
is scope, not difficulty — say which matter and they are straightforward
additions on this engine.

---

## Six more activities + icon sizing pass (2026-07-30)

**26 activities, 6 categories.** Music split out of Create so no category
exceeds six — six is the cap that keeps a category grid on one non-scrolling
screen at every size.

### New

- **Tracing** — letters by tapping dots in order. Real tracing means dragging,
  and `touchmove` is cancelled app-wide. Tapping dots teaches the part that
  actually matters at three: **stroke order and direction**, which children get
  wrong for years. Staying on the line is motor control that comes later.
  Data is stroke polylines with dots generated at runtime, so 12 letters cost
  almost nothing.
- **Opposites** — big/small, hot/cold. Every pair is *drawable*; "kind/unkind"
  is a real opposite but not a picture.
- **Patterns** — ABAB and AABB only. ABC repeats need more working memory than
  a 3-year-old has, and a pattern she cannot see is just a guess.
- **Shape sort** — tap-tap, not drag. Removes the motor difficulty and leaves
  the actual skill (matching form to form) untouched. The hole is the same
  silhouette as the piece, from one shared CSS class set, so they cannot drift.
- **Drums** — eight synthesised pads (filtered noise bursts + pitched sweeps
  added to audioManager). Percussion is the one instrument where a toddler's
  instinct — hit it hard and often — is correct technique.
- **Stickers** — pick, then tap to place. Positions stored as percentages so
  they survive rotation.

### Icon sizing

Icons shipped at a fixed 24px regardless of their button, which looked lost in
a 68px round button. They now scale with the button (~45% of it): 22/28/38 for
sm/md/lg, 30 in the top bar, 26 for the favourite star.

### Bugs found and fixed in this pass

- **Tracing hit circles overlapped.** Every dot had r=17; adjacent dots are 42
  apart, so neighbours overlapped and — since a later sibling paints on top — a
  tap aimed at the active dot could land on the *next* one and do nothing. Now
  only the active dot gets a large radius (30 vs 12): no overlap, and the
  biggest target sits exactly where she is being asked to tap.
- **Tracing canvas collapsed**, then became a tall empty box. `height:100%`
  against an auto-height card fell back to the SVG's intrinsic size; forcing
  the card to full height instead just padded it with whitespace. Fixed by
  driving the canvas from a definite WIDTH plus an explicit `aspect-ratio`.
  Also slimmed this deck's arrows and card padding — the canvas is
  width-constrained, so horizontal chrome comes straight out of the dot size.
  Active dot went 24px → 55px at 320, and 76px at 390.
- **Rhyme lines were 34px tall** and are tappable (each re-reads its line).
  Given a 48px floor.

### Verified — full sweep, all passing

At **390x844, 844x390, 320x568 and 1280x800**:

- 26/26 activities open, render and return home; all six categories navigate;
  card counts per category correct.
- **Nothing scrolls** in either axis, on any screen, at any size.
- **Zero console errors, zero page errors, zero external network requests.**
- Behaviour checks, not just rendering:
  - Tracing: an out-of-order dot tap is ignored; in-order taps advance and draw
    the segment.
  - Patterns: the correct choice is always present, and filling the slot works.
  - Shape sort: a wrong hole does not advance the round; the right one wins.
  - Opposites: three unique choices, prompt drawn from either end of the pair.
  - Drums: all 8 pads strike without error.
  - Stickers: 3 placed, clear removes exactly those.
  - Match: 6 cards, all face down at start.
  - Parent gate: a 1.1s hold still does not advance past stage 1.
- Smallest targets: 68px chrome, 61px colour swatch, 56px sticker, 55px active
  tracing dot (320px screen; 76px on a normal phone), 48px rhyme line.

### Still not built from the original brief

Jigsaw, fishing, bedtime stories / interactive storybook, picture match as a
separate game, alphabet tracing with freehand strokes (blocked by the gesture
lockdown — see Tracing). All are scope rather than difficulty.
