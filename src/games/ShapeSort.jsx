import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Post the shape into the hole that fits.
 *
 * The physical toy needs a drag; this app cancels `touchmove` so a toddler
 * cannot swipe out of the play area. So it is TAP-TAP: the shape to post is
 * already chosen and shown large, and she taps the hole it belongs in. That
 * removes a whole layer of motor difficulty and leaves the actual skill —
 * matching form to form — untouched.
 *
 * Every shape posted is replaced by another, so the board never empties and
 * there is nothing to finish or fail.
 */

const SHAPES = [
  { id: "circle", label: "circle", color: "#ef5f5f" },
  { id: "square", label: "square", color: "#4fb3f0" },
  { id: "triangle", label: "triangle", color: "#5ed48a" },
  { id: "star", label: "star", color: "#ffd23f" },
  { id: "heart", label: "heart", color: "#ff8fb1" },
  { id: "diamond", label: "diamond", color: "#a78bfa" },
];

const BOARD = 4; // holes on screen

const PRAISE = ["It fits!", "Well done!", "That's it!", "Perfect!"];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeRound(previousId) {
  const holes = shuffle(SHAPES).slice(0, BOARD);
  // Don't ask for the same shape twice running — it looks like nothing changed.
  const candidates = holes.filter((h) => h.id !== previousId);
  const target = pickOne(candidates.length ? candidates : holes);
  return { id: Math.random().toString(36).slice(2), holes, target };
}

export default function ShapeSort({ onHome }) {
  const [round, setRound] = useState(() => makeRound(null));
  const [wonId, setWonId] = useState(null);
  const [wobbleId, setWobbleId] = useState(null);

  const timers = useRef([]);
  const after = useCallback((ms, fn) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () => speak(`Where does the ${round.target.label} go?`),
      420,
    );
    return () => clearTimeout(t);
  }, [round]);

  const tap = (hole) => {
    if (wonId) return;

    if (hole.id === round.target.id) {
      playSfx("chime");
      vibrate(40);
      setWonId(hole.id);
      after(160, () => speak(`${pickOne(PRAISE)} A ${hole.label}.`));
      after(1900, () => {
        setWonId(null);
        setRound((prev) => makeRound(prev.target.id));
      });
    } else {
      playSfx("soft");
      setWobbleId(hole.id);
      after(450, () => setWobbleId(null));
      after(750, () => speak(`Find the ${round.target.label}`));
    }
  };

  return (
    <GameShell title="Shape sort" tone="think" onHome={onHome}>
      {/* The shape waiting to be posted. */}
      <motion.button
        type="button"
        className="ss-holder tappable"
        onPointerDown={() => speak(`Where does the ${round.target.label} go?`)}
        onClick={(e) => e.preventDefault()}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        aria-label={`${round.target.label}. Tap to hear the question again`}
      >
        <span
          className={`shape shape-${round.target.id}`}
          style={{ "--shape-color": round.target.color }}
        />
      </motion.button>

      <div className="ss-board" key={round.id}>
        {round.holes.map((hole) => {
          const won = wonId === hole.id;
          const wobbling = wobbleId === hole.id;
          return (
            <motion.button
              key={hole.id}
              type="button"
              className={`ss-hole tappable${won ? " is-won" : ""}`}
              animate={
                won
                  ? { scale: [1, 1.16, 1.06] }
                  : wobbling
                    ? { x: [0, -10, 10, -6, 0] }
                    : { scale: 1, x: 0 }
              }
              transition={{ duration: won ? 0.55 : 0.4, ease: "easeOut" }}
              onPointerDown={() => tap(hole)}
              onClick={(e) => e.preventDefault()}
              aria-label={`${hole.label} hole`}
            >
              {/* The hole is the same silhouette in shadow — matching form to
                  form is the whole exercise. */}
              <span className={`shape shape-${hole.id} is-hole`} />
              {won && (
                <span
                  className={`shape shape-${hole.id} is-filled`}
                  style={{ "--shape-color": hole.color }}
                />
              )}
              {won && <Sparkles count={12} distance={100} />}
            </motion.button>
          );
        })}
      </div>
    </GameShell>
  );
}
