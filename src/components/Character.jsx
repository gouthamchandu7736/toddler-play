import { useCallback, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Sparkles from "./Sparkles.jsx";
import { playSfx, speak, vibrate } from "../audio/audioManager.js";

/**
 * One tappable character.
 *
 * Tapping fires, in this order and all within the same frame:
 *   pop SFX → haptic buzz → squash-and-bounce → sparkle burst → spoken name.
 *
 * Bound to onPointerDown, not onClick, deliberately. A click event waits for
 * the finger to LIFT; on a slow device that is 100-300 ms of nothing after
 * the child has already touched the screen, which reads as a dead tap
 * (PLAN.md Section 2 rule 2).
 */
export default function Character({ character, onTapped }) {
  const controls = useAnimationControls();
  const [burst, setBurst] = useState(0);

  // Toddlers drum on the screen. Throttle only the SPEECH — the visual and
  // the pop still fire on every single touch, so no tap ever feels dead.
  const lastSpokeAt = useRef(0);

  const handleTap = useCallback(() => {
    playSfx("pop");
    vibrate(30);

    // Squash on contact, overshoot, settle. Transform-only, so it stays on
    // the compositor and holds 60fps on cheap hardware.
    controls.start({
      scale: [1, 0.82, 1.18, 1],
      rotate: [0, -7, 7, 0],
      transition: { duration: 0.5, ease: "easeOut" },
    });

    setBurst((n) => n + 1);

    const now = Date.now();
    if (now - lastSpokeAt.current > 600) {
      lastSpokeAt.current = now;
      // "Cow. Moo." — name first, because naming is the point of the scene.
      speak(`${character.label}. ${character.soundText}.`);
    }

    if (onTapped) onTapped(character);
  }, [character, controls, onTapped]);

  return (
    <motion.button
      type="button"
      className="character tappable"
      style={{ "--tile-color": character.color }}
      animate={controls}
      onPointerDown={handleTap}
      // A pointerdown handler already fired; suppress the synthetic click so
      // a mouse doesn't trigger everything twice on desktop.
      onClick={(e) => e.preventDefault()}
      aria-label={character.label}
    >
      <span className="character-emoji">{character.emoji}</span>
      {burst > 0 && <Sparkles key={burst} count={8} distance={80} />}
    </motion.button>
  );
}
