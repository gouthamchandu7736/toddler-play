import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import HomeButton from "../components/HomeButton.jsx";
import Brand from "../components/Brand.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * "Tap something red."
 *
 * The only game in the app with a right answer, so it is the one that most
 * needs PLAN.md Section 2 rule 3 enforced: a wrong tap gets a soft wobble and
 * a quiet neutral blip, then the prompt is repeated. There is no error sound,
 * no penalty, no score, no timer, and no way to lose. The child can tap every
 * shape on screen and will eventually be congratulated.
 */

const COLORS = [
  { id: "red", name: "red", hex: "#e63946" },
  { id: "blue", name: "blue", hex: "#457b9d" },
  { id: "yellow", name: "yellow", hex: "#f4d35e" },
  { id: "green", name: "green", hex: "#43aa8b" },
  { id: "orange", name: "orange", hex: "#f3722c" },
  { id: "purple", name: "purple", hex: "#9d4edd" },
];

const PRAISE = ["Yes!", "Well done!", "That's it!", "Great job!", "Lovely!"];

const ROUND_SIZE = 4;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeRound() {
  const chosen = shuffle(COLORS).slice(0, ROUND_SIZE);
  const target = pickOne(chosen);
  return {
    // A fresh id per round forces React to remount the tiles, which resets
    // any half-finished wobble from the previous round.
    id: Math.random().toString(36).slice(2),
    target,
    tiles: shuffle(chosen),
  };
}

export default function FindColor({ onHome }) {
  const [round, setRound] = useState(makeRound);
  const [wonId, setWonId] = useState(null);
  const [wobbleId, setWobbleId] = useState(null);

  // Every timeout is tracked so leaving the screen mid-celebration can't fire
  // speech or a state update after unmount.
  const timers = useRef([]);
  const after = useCallback((ms, fn) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
  }, []);

  // Announce each new round. The short delay lets any celebration finish
  // talking first, since speak() cancels whatever is mid-sentence.
  useEffect(() => {
    const t = setTimeout(() => speak(`Tap something ${round.target.name}`), 350);
    return () => clearTimeout(t);
  }, [round]);

  const handleTap = (tile) => {
    if (wonId) return; // celebration in flight; ignore extra taps

    if (tile.id === round.target.id) {
      playSfx("chime");
      vibrate(40);
      setWonId(tile.id);
      after(150, () => speak(`${pickOne(PRAISE)} ${tile.name}!`));
      after(1900, () => {
        setWonId(null);
        setRound(makeRound());
      });
    } else {
      // Gentle, unrewarding, never punishing.
      playSfx("soft");
      setWobbleId(tile.id);
      after(450, () => setWobbleId(null));
      after(700, () => speak(`Find ${round.target.name}`));
    }
  };

  return (
    <div className="screen game find-color">
      <Brand />

      {/* The prompt as a giant colour swatch, so the child can match by sight
          without hearing or reading the word. */}
      <div className="fc-prompt">
        <motion.div
          className="fc-prompt-swatch"
          style={{ background: round.target.hex }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <button
          type="button"
          className="fc-repeat tappable"
          onPointerDown={() => speak(`Tap something ${round.target.name}`)}
          onClick={(e) => e.preventDefault()}
          aria-label="Say it again"
        >
          🔊
        </button>
      </div>

      <div className="fc-grid" key={round.id}>
        {round.tiles.map((tile) => {
          const won = wonId === tile.id;
          const wobbling = wobbleId === tile.id;
          return (
            <motion.button
              key={tile.id}
              type="button"
              className={`fc-tile tappable${won ? " is-won" : ""}`}
              style={{ background: tile.hex }}
              animate={
                won
                  ? { scale: [1, 1.25, 1.1], rotate: [0, 8, -8, 0] }
                  : wobbling
                    ? { x: [0, -12, 12, -8, 0] }
                    : { scale: 1, x: 0, rotate: 0 }
              }
              transition={{ duration: won ? 0.6 : 0.4, ease: "easeOut" }}
              onPointerDown={() => handleTap(tile)}
              onClick={(e) => e.preventDefault()}
              aria-label={tile.name}
            >
              {won && <Sparkles count={12} distance={120} />}
            </motion.button>
          );
        })}
      </div>

      <HomeButton onClick={onHome} />
    </div>
  );
}
