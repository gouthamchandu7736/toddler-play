# PROGRESS

Session starter: **"Read `PLAN.md` and `PROGRESS.md`. We have completed through Phase N.
Do Phase N+1 exactly as specified, following the design rules in Section 2. When done,
run `npm run dev`, confirm no build errors, tell me what to test, and update `PROGRESS.md`."**

## Phases

- [x] **Phase 0 — Project setup & lockdown** _(done 2026-07-29)_
- [ ] **Phase 1 — Core tap-to-discover Farm scene**
- [ ] **Phase 2 — Audio system + juice**
- [ ] **Phase 3 — Splash, Home & Parent Gate**
- [ ] **Phase 4 — Mini-game: Find the Color**
- [ ] **Phase 5 — Mini-game: Shape Pop**
- [ ] **Phase 6 — Mini-game: Copy the Tune**
- [ ] **Phase 7 — PWA: offline + installable + fullscreen**
- [ ] **Phase 8 — Polish, safety pass & deploy**

---

## Phase 0 — done

**Built**

- Vite + React (JavaScript) scaffold, `npm run dev` / `build` / `preview` all clean.
- Deps: `framer-motion`; dev deps: `vite-plugin-pwa` (not wired up until Phase 7), `oxlint`.
- Full folder structure from PLAN.md Section 5. Files a later phase owns exist as
  one-line stubs naming their phase.
- `index.html`: locked viewport (`user-scalable=no`, `maximum-scale=1`,
  `viewport-fit=cover`), theme color, web-app-capable meta.
- `src/styles/global.css`: reset, kid-scale type, palette, `--tap-min: 88px`,
  no text selection / callout / tap highlight, `touch-action: manipulation`,
  `overscroll-behavior: none`, fixed full-viewport non-scrolling root,
  safe-area padding, `prefers-reduced-motion` handling.
- `src/hooks/useNoGestures.js`: non-passive listeners cancelling touchmove,
  iOS `gesture*` (pinch), `dblclick`, `contextmenu`, `selectstart`,
  ctrl+wheel and ctrl/cmd +/-/0 zoom. Applied globally from `App.jsx`.
- `src/App.jsx`: screen-state machine (`splash | home | scene | game`) with a
  `payload` field carrying which scene/game, plus `go()` / `goHome()`.
  Renders placeholder screens for now. **No router on purpose** — no URL bar,
  no back button, no history for a toddler to reach.

**Environment note**

Node was not installed on this machine. Node **24.18.0 LTS** was installed
user-locally to `~/.local/node` (checksum-verified from nodejs.org) and added to
`PATH` via `~/.bashrc`. Remove with `rm -rf ~/.local/node` plus the two `~/.bashrc` lines.
New terminals pick it up automatically; in an already-open one run
`export PATH="$HOME/.local/node/bin:$PATH"`.

**Known / deferred**

- `npm audit` reports a high-severity advisory in `brace-expansion`, reached only
  through `vite-plugin-pwa → workbox-build → ejs → jake → filelist → minimatch`.
  Build-time only, never shipped to the browser; the fix is a breaking downgrade.
  Re-check at Phase 7.
- `public/icons/` is empty — real PWA icons are a Phase 7 deliverable.
- `src/assets/audio/` is empty — SFX land in Phase 2.

**Decisions worth remembering**

- Screen state lives in one `{ screen, payload }` object so adding a scene or
  mini-game never adds a screen state.
- `touchmove` is cancelled unconditionally: nothing in this app scrolls or drags,
  so every touchmove is an accidental swipe, a pinch, or a pull-to-refresh.
  If a future feature needs dragging, that listener needs a scope, not a removal.
