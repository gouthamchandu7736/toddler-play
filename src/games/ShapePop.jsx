import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import HomeButton from "../components/HomeButton.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Pure sensory play: big shapes drift slowly upward, tapping pops them.
 *
 * No goal, no score, no timer, nothing to miss. A shape that floats off the
 * top is replaced without comment — drifting away is not failing.
 *
 * Movement is slow on purpose (~60-90 px/s). A toddler's aim is poor and their
 * reaction time is long; anything quick enough to feel "fun" to an adult is
 * unhittable for them.
 *
 * Travel is animated as a TRANSFORM in pixels, not as the `bottom` property.
 * Two reasons: transforms stay on the compositor and hold 60fps on cheap
 * hardware, and interpolating between mixed CSS units (-30vmin → 115vh) is
 * undefined — it snaps straight to the end instead of animating.
 */

const SHAPES = ["circle", "square", "triangle", "star"];

const COLORS = [
  { name: "red", hex: "#e63946" },
  { name: "blue", hex: "#457b9d" },
  { name: "yellow", hex: "#f4d35e" },
  { name: "green", hex: "#43aa8b" },
  { name: "orange", hex: "#f3722c" },
  { name: "purple", hex: "#9d4edd" },
  { name: "pink", hex: "#ff70a6" },
];

const MAX_ON_SCREEN = 6;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

let seq = 0;

/**
 * @param spread when true, the shape starts part-way up the screen. Used for
 *   the opening batch so the child doesn't face an empty screen while the
 *   first shapes climb into view.
 */
function makeBubble(spread = false) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vmin = Math.min(vw, vh);

  const sizePx = ((22 + Math.random() * 12) / 100) * vmin;
  const travel = vh + sizePx * 1.4; // fully below → fully above
  const speed = 60 + Math.random() * 30; // px per second
  const fullDuration = travel / speed;
  const progress = spread ? Math.random() * 0.8 : 0;

  return {
    key: `b${seq++}`,
    shape: pick(SHAPES),
    color: pick(COLORS),
    sizePx,
    left: 6 + Math.random() * (100 - 12 - (sizePx / vw) * 100), // %, stays on screen
    travel,
    startY: -travel * progress,
    duration: fullDuration * (1 - progress),
    drift: (Math.random() - 0.5) * 70, // px of lateral wander
    spin: (Math.random() - 0.5) * 40, // degrees
  };
}

function Bubble({ bubble, onPop, onExpire }) {
  const controls = useAnimationControls();
  const [popped, setPopped] = useState(false);
  const poppedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    controls
      .start({
        y: -bubble.travel,
        x: [0, bubble.drift, 0],
        rotate: bubble.spin,
        transition: { duration: bubble.duration, ease: "linear" },
      })
      .then(() => {
        // Reached the top untouched — recycle quietly.
        if (!cancelled && !poppedRef.current) onExpire(bubble.key);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [bubble, controls, onExpire]);

  const handlePop = () => {
    if (poppedRef.current) return;
    poppedRef.current = true;
    setPopped(true);

    // stop() freezes y wherever it currently is, so the burst happens where
    // the child actually touched rather than snapping back to the start.
    controls.stop();
    controls.start({
      scale: [1, 1.35, 0],
      opacity: [1, 1, 0],
      transition: { duration: 0.35, ease: "easeOut" },
    });

    onPop(bubble);
  };

  return (
    <motion.button
      type="button"
      className={`bubble bubble-${bubble.shape} tappable`}
      style={{
        background: bubble.color.hex,
        left: `${bubble.left}%`,
        width: bubble.sizePx,
        height: bubble.sizePx,
        bottom: -bubble.sizePx,
      }}
      initial={{ y: bubble.startY, x: 0, rotate: 0, scale: 1, opacity: 1 }}
      animate={controls}
      onPointerDown={handlePop}
      onClick={(e) => e.preventDefault()}
      aria-label={`${bubble.color.name} ${bubble.shape}`}
    >
      {popped && <Sparkles count={10} distance={110} />}
    </motion.button>
  );
}

export default function ShapePop({ onHome }) {
  const [bubbles, setBubbles] = useState(() =>
    Array.from({ length: MAX_ON_SCREEN }, () => makeBubble(true)),
  );

  const lastSpokeAt = useRef(0);
  const timers = useRef([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
  }, []);

  const replace = useCallback((key) => {
    setBubbles((list) => list.map((b) => (b.key === key ? makeBubble() : b)));
  }, []);

  // Travel distances are computed in pixels at spawn time, so a rotated device
  // would leave the in-flight shapes using stale geometry. Rebuild on a real
  // orientation change only — mobile address bars fire resize constantly, and
  // wiping the screen every time the toolbar slides would be maddening.
  useEffect(() => {
    let wasPortrait = window.innerHeight >= window.innerWidth;
    const onResize = () => {
      const isPortrait = window.innerHeight >= window.innerWidth;
      if (isPortrait !== wasPortrait) {
        wasPortrait = isPortrait;
        setBubbles(Array.from({ length: MAX_ON_SCREEN }, () => makeBubble(true)));
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handlePop = useCallback(
    (bubble) => {
      playSfx("pop");
      vibrate(25);

      const t = setTimeout(() => replace(bubble.key), 600);
      timers.current.push(t);

      // Naming every pop would be a wall of overlapping speech; name roughly
      // one in three, so the words still land.
      const now = Date.now();
      if (now - lastSpokeAt.current > 1400) {
        lastSpokeAt.current = now;
        speak(`${bubble.color.name} ${bubble.shape}`);
      }
    },
    [replace],
  );

  return (
    <div className="screen game shape-pop">
      {bubbles.map((b) => (
        <Bubble key={b.key} bubble={b} onPop={handlePop} onExpire={replace} />
      ))}
      <HomeButton onClick={onHome} />
    </div>
  );
}
