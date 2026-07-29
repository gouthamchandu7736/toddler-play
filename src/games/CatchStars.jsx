import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import { playNote, NOTES, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Stars drift down; touching one makes it burst into sparkles and chime.
 *
 * A star that reaches the bottom just fades — there is no basket to miss, no
 * life lost, no counter resetting. The falling is the show; catching is the
 * bonus.
 *
 * Speed is 55-80 px/s, chosen the same way as Shape Pop: a toddler's aim and
 * reaction time make anything an adult would call "fun and fast" simply
 * uncatchable.
 *
 * Notes rise as more stars are caught in quick succession, so a good run
 * sounds like a little melody rather than the same ding repeated.
 */

const MAX_ON_SCREEN = 5;
const SHAPES = ["⭐", "🌟", "✨", "💫"];
const SCALE = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6];

let seq = 0;

function makeStar(spread = false) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vmin = Math.min(vw, vh);

  // Floor of 62px: on a 320px screen the proportional size alone produced 41px
  // stars, too small for a toddler to land a finger on.
  const sizePx = Math.max(62, ((13 + Math.random() * 8) / 100) * vmin);
  const travel = vh + sizePx * 1.6;
  const speed = 55 + Math.random() * 25; // px per second
  const full = travel / speed;
  const progress = spread ? Math.random() * 0.8 : 0;

  return {
    key: `s${seq++}`,
    glyph: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    sizePx,
    left: 5 + Math.random() * (100 - 10 - (sizePx / vw) * 100),
    travel,
    startY: travel * progress,
    duration: full * (1 - progress),
    sway: (Math.random() - 0.5) * 60,
    spin: (Math.random() - 0.5) * 90,
  };
}

function Star({ star, onCatch, onMiss }) {
  const controls = useAnimationControls();
  const [caught, setCaught] = useState(false);
  const caughtRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    controls
      .start({
        y: star.travel,
        x: [0, star.sway, 0],
        rotate: star.spin,
        transition: { duration: star.duration, ease: "linear" },
      })
      .then(() => {
        if (!cancelled && !caughtRef.current) onMiss(star.key);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [star, controls, onMiss]);

  const grab = () => {
    if (caughtRef.current) return;
    caughtRef.current = true;
    setCaught(true);

    // Freeze where the finger landed, then burst there.
    controls.stop();
    controls.start({
      scale: [1, 1.5, 0],
      opacity: [1, 1, 0],
      transition: { duration: 0.34, ease: "easeOut" },
    });

    onCatch(star);
  };

  return (
    <motion.button
      type="button"
      className="cs-star tappable"
      style={{
        left: `${star.left}%`,
        width: star.sizePx,
        height: star.sizePx,
        top: -star.sizePx,
      }}
      initial={{ y: star.startY, x: 0, rotate: 0, scale: 1, opacity: 1 }}
      animate={controls}
      onPointerDown={grab}
      onClick={(e) => e.preventDefault()}
      aria-label="Star"
    >
      <span className="cs-glyph">{star.glyph}</span>
      {caught && <Sparkles count={10} distance={90} />}
    </motion.button>
  );
}

export default function CatchStars({ onHome }) {
  const [stars, setStars] = useState(() =>
    Array.from({ length: MAX_ON_SCREEN }, () => makeStar(true)),
  );

  const streak = useRef(0);
  const lastCatch = useRef(0);
  const timers = useRef([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
  }, []);

  const replace = useCallback((key) => {
    setStars((list) => list.map((s) => (s.key === key ? makeStar() : s)));
  }, []);

  // Travel is measured in pixels at spawn, so a real orientation change needs
  // fresh geometry. Ignore ordinary resizes: mobile address bars fire those
  // constantly and wiping the screen each time would be maddening.
  useEffect(() => {
    let wasPortrait = window.innerHeight >= window.innerWidth;
    const onResize = () => {
      const isPortrait = window.innerHeight >= window.innerWidth;
      if (isPortrait !== wasPortrait) {
        wasPortrait = isPortrait;
        setStars(Array.from({ length: MAX_ON_SCREEN }, () => makeStar(true)));
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onCatch = useCallback(
    (star) => {
      const now = Date.now();
      streak.current = now - lastCatch.current < 2500 ? streak.current + 1 : 0;
      lastCatch.current = now;

      playNote(SCALE[Math.min(streak.current, SCALE.length - 1)], 0.4);
      vibrate(25);

      const t = setTimeout(() => replace(star.key), 620);
      timers.current.push(t);
    },
    [replace],
  );

  const onMiss = useCallback(
    (key) => {
      // Reaching the bottom is not failing; nothing is announced.
      replace(key);
    },
    [replace],
  );

  return (
    <GameShell title="Catch" tone="play" onHome={onHome} className="catch-stars">
      {stars.map((s) => (
        <Star key={s.key} star={s} onCatch={onCatch} onMiss={onMiss} />
      ))}
    </GameShell>
  );
}
