import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import { ANIMALS } from "../data/scenes.js";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Peekaboo — the gentle relative of whack-a-mole.
 *
 * Whack-a-mole is a reaction test, and reaction tests are exactly the genre a
 * toddler loses at. The differences here:
 *
 * - Animals stay up for 2.5-4 seconds, not a fraction of one.
 * - Missing one costs nothing. It waves and ducks back down; no sound of
 *   failure, no counter, nothing to lose.
 * - Two or three are up at once, so there is almost always something to tap.
 *
 * What she practises is object permanence and anticipation — noticing that
 * something gone is not gone forever — which is the actual developmental
 * content of peekaboo.
 */

const HOLES = 6;
const MIN_UP_MS = 2500;
const MAX_UP_MS = 4000;
const MIN_DOWN_MS = 700;
const MAX_DOWN_MS = 2200;

const rand = (min, max) => min + Math.random() * (max - min);
const pickAnimal = () => ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

export default function Peekaboo({ onHome }) {
  const [holes, setHoles] = useState(() =>
    Array.from({ length: HOLES }, () => ({ up: false, animal: pickAnimal(), popped: false })),
  );

  // One timer per hole, each rescheduling itself — a single global tick would
  // make every animal appear and vanish in lockstep, which looks mechanical.
  const timers = useRef([]);
  const alive = useRef(true);

  const schedule = useCallback((index, delay, next) => {
    timers.current[index] = setTimeout(() => {
      if (alive.current) next();
    }, delay);
  }, []);

  const cycle = useCallback(
    (index, goingUp) => {
      setHoles((prev) => {
        const copy = [...prev];
        copy[index] = goingUp
          ? { up: true, animal: pickAnimal(), popped: false }
          : { ...copy[index], up: false, popped: false };
        return copy;
      });

      schedule(
        index,
        goingUp ? rand(MIN_UP_MS, MAX_UP_MS) : rand(MIN_DOWN_MS, MAX_DOWN_MS),
        () => cycle(index, !goingUp),
      );
    },
    [schedule],
  );

  useEffect(() => {
    alive.current = true;
    // Stagger the openings so they don't all rise together.
    holes.forEach((_, i) => schedule(i, rand(200, 2600), () => cycle(i, true)));

    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
    // Intentionally once: the per-hole timers own the loop from here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (index) => {
    const hole = holes[index];
    if (!hole.up || hole.popped) {
      // Tapping an empty hole still does something — a soft knock — because a
      // tap that produces nothing at all reads as a broken screen.
      playSfx("soft");
      return;
    }

    playSfx("chime");
    vibrate(30);
    speak(hole.animal.label);

    setHoles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], popped: true };
      return copy;
    });

    clearTimeout(timers.current[index]);
    schedule(index, 700, () => cycle(index, false));
  };

  return (
    <GameShell title="Peekaboo" tone="play" onHome={onHome}>
      <div className="pb-grid">
        {holes.map((hole, i) => (
          <button
            key={i}
            type="button"
            className="pb-hole tappable"
            onPointerDown={() => tap(i)}
            onClick={(e) => e.preventDefault()}
            aria-label={hole.up ? hole.animal.label : "Empty burrow"}
          >
            <span className="pb-mound" aria-hidden="true" />
            <motion.span
              className="pb-animal"
              style={{ "--tile-color": hole.animal.color }}
              initial={false}
              animate={{
                y: hole.up ? "0%" : "115%",
                scale: hole.popped ? 1.2 : 1,
                opacity: hole.popped ? 0 : 1,
              }}
              transition={{
                y: { type: "spring", stiffness: 180, damping: 20 },
                scale: { duration: 0.28 },
                opacity: { duration: 0.28 },
              }}
            >
              {hole.animal.emoji}
            </motion.span>
            {hole.popped && <Sparkles count={8} distance={70} />}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
