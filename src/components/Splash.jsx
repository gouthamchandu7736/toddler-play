import { motion } from "framer-motion";
import { unlock, playSfx, speak } from "../audio/audioManager.js";

/**
 * "Tap to start".
 *
 * This screen exists for one technical reason: mobile browsers refuse to play
 * audio until the user has interacted with the page. Every sound in the app
 * depends on unlock() running here first.
 *
 * The whole screen is the button — a 3-year-old should not have to aim.
 */
export default function Splash({ onStart }) {
  const handleStart = () => {
    unlock(); // must happen synchronously inside the gesture
    playSfx("chime");
    speak("Let's play!");
    onStart();
  };

  return (
    <button
      type="button"
      className="screen splash"
      onPointerDown={handleStart}
      onClick={(e) => e.preventDefault()}
      aria-label="Tap to start"
    >
      <motion.div
        className="splash-art"
        animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        🐄
      </motion.div>

      <motion.div
        className="splash-hint"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        👆
      </motion.div>

      {/* Text is for the grown-up handing over the phone, not for the child —
          the tapping hand above carries the meaning. */}
      <p className="splash-text">Tap to start</p>
    </button>
  );
}
