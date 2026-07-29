import { memo } from "react";

/**
 * The decorative backdrop: a soft gradient sky with drifting clouds, bubbles
 * and twinkling stars.
 *
 * Three constraints shaped it:
 *
 * 1. **It must never compete with the game.** Everything is low-contrast and
 *    slow. A background that catches the eye is a background that pulls a
 *    toddler off the task.
 * 2. **It must be free.** All shapes are CSS — no images, no SVG filters, no
 *    canvas. Animation is transform and opacity only, so it stays on the
 *    compositor and costs no main-thread work on a cheap phone.
 * 3. **It must be silent under reduced-motion.** Handled in CSS.
 *
 * Memoised because it re-renders for nothing otherwise — it has no state and
 * its props never change during a session.
 */

// Fixed, hand-placed positions rather than Math.random(): random values would
// change on every render and make the layout jump.
const CLOUDS = [
  { top: "8%", left: "-12%", scale: 1, dur: 66, delay: 0 },
  { top: "24%", left: "-24%", scale: 0.7, dur: 86, delay: -20 },
  { top: "58%", left: "-18%", scale: 0.85, dur: 74, delay: -45 },
];

const BUBBLES = [
  { left: "12%", size: 34, dur: 19, delay: 0 },
  { left: "28%", size: 20, dur: 24, delay: -6 },
  { left: "48%", size: 44, dur: 27, delay: -12 },
  { left: "68%", size: 24, dur: 21, delay: -3 },
  { left: "84%", size: 32, dur: 30, delay: -16 },
];

const STARS = [
  { top: "12%", left: "18%", size: 12, delay: 0 },
  { top: "20%", left: "78%", size: 9, delay: -1.4 },
  { top: "44%", left: "8%", size: 8, delay: -2.6 },
  { top: "66%", left: "88%", size: 11, delay: -0.8 },
  { top: "78%", left: "32%", size: 8, delay: -3.2 },
];

function PlayfulBackground({ variant = "sky" }) {
  return (
    <div className={`bg bg-${variant}`} aria-hidden="true">
      <div className="bg-wash" />

      {CLOUDS.map((c, i) => (
        <div
          key={`c${i}`}
          className="bg-cloud"
          style={{
            top: c.top,
            left: c.left,
            "--scale": c.scale,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {BUBBLES.map((b, i) => (
        <div
          key={`b${i}`}
          className="bg-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {STARS.map((s, i) => (
        <div
          key={`s${i}`}
          className="bg-star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Rolling hills, anchored to the bottom. Pure CSS ellipses. */}
      <div className="bg-hill bg-hill-back" />
      <div className="bg-hill bg-hill-front" />
    </div>
  );
}

export default memo(PlayfulBackground);
