import { motion } from "framer-motion";
import Brand from "./Brand.jsx";
import { unlock, playSfx, speak } from "../audio/audioManager.js";

/**
 * "Tap to start".
 *
 * This screen exists for one technical reason: mobile browsers refuse to play
 * audio until the user has interacted with the page. Every sound in the app
 * depends on unlock() running here first.
 *
 * The whole screen is the button — a 3-year-old should not have to aim.
 *
 * The app icon is the hero here rather than an emoji, so the picture she taps
 * on the home screen is the same picture that greets her when it opens.
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
        animate={{ scale: [1, 1.05, 1], rotate: [0, 1.5, -1.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brand variant="full" />
      </motion.div>

      <motion.div
        className="splash-hint"
        animate={{ opacity: [0.5, 1, 0.5], y: [0, -8, 0] }}
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
