import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import HomeButton from "../components/HomeButton.jsx";
import Brand from "../components/Brand.jsx";
import { ANIMALS, BIRDS, FARM, VEHICLES } from "../data/scenes.js";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * "Where is the cow?" — vocabulary and listening.
 *
 * Choices are drawn from ONE category per round (all birds, or all vehicles).
 * Mixing a lion in with three lorries makes the answer findable by elimination
 * without knowing any of the words, which defeats the point.
 *
 * This is the one activity in the app that genuinely needs sound — the whole
 * task is hearing a word and matching it to a picture. So the replay button is
 * full size and sits where the round prompt would be, not tucked in a corner.
 *
 * As everywhere else: no score, no timer, no losing. A wrong tap wobbles and
 * repeats the question.
 */

const CATEGORIES = [
  { id: "farm", label: "farm animals", items: FARM },
  { id: "animals", label: "animals", items: ANIMALS },
  { id: "birds", label: "birds", items: BIRDS },
  { id: "vehicles", label: "vehicles", items: VEHICLES },
];

const PRAISE = ["Yes!", "Well done!", "That's it!", "Clever girl!", "Perfect!"];

const CHOICES = 4;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeRound(previousCategoryId) {
  // Avoid repeating a category twice running so the screen keeps changing.
  const pool = CATEGORIES.filter((c) => c.id !== previousCategoryId);
  const category = pickOne(pool);
  const tiles = shuffle(category.items).slice(0, CHOICES);
  return {
    id: Math.random().toString(36).slice(2),
    categoryId: category.id,
    target: pickOne(tiles),
    tiles: shuffle(tiles),
  };
}

export default function FindIt({ onHome }) {
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

  const ask = useCallback((r) => speak(`Where is the ${r.target.label}?`), []);

  useEffect(() => {
    const t = setTimeout(() => ask(round), 400);
    return () => clearTimeout(t);
  }, [round, ask]);

  const handleTap = (tile) => {
    if (wonId) return; // celebration in flight

    if (tile.id === round.target.id) {
      playSfx("chime");
      vibrate(40);
      setWonId(tile.id);
      after(150, () => speak(`${pickOne(PRAISE)} ${tile.label}!`));
      after(2100, () => {
        setWonId(null);
        setRound((prev) => makeRound(prev.categoryId));
      });
    } else {
      playSfx("soft");
      setWobbleId(tile.id);
      after(450, () => setWobbleId(null));
      after(750, () => ask(round));
    }
  };

  return (
    <div className="screen game find-it">
      <Brand />

      {/* The prompt IS the replay button — the question is the whole task, so
          hearing it again must be the most obvious thing on screen. */}
      <button
        type="button"
        className="fi-ask tappable"
        onPointerDown={() => ask(round)}
        onClick={(e) => e.preventDefault()}
        aria-label="Say the question again"
      >
        <motion.span
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          🔊
        </motion.span>
      </button>

      <div className="fi-grid" key={round.id}>
        {round.tiles.map((tile) => {
          const won = wonId === tile.id;
          const wobbling = wobbleId === tile.id;
          return (
            <motion.button
              key={tile.id}
              type="button"
              className={`fi-tile tappable${won ? " is-won" : ""}`}
              style={{ "--tile-color": tile.color }}
              animate={
                won
                  ? { scale: [1, 1.2, 1.08], rotate: [0, 7, -7, 0] }
                  : wobbling
                    ? { x: [0, -12, 12, -8, 0] }
                    : { scale: 1, x: 0, rotate: 0 }
              }
              transition={{ duration: won ? 0.6 : 0.4, ease: "easeOut" }}
              onPointerDown={() => handleTap(tile)}
              onClick={(e) => e.preventDefault()}
              aria-label={tile.label}
            >
              <span className="fi-emoji">{tile.emoji}</span>
              {won && <Sparkles count={12} distance={120} />}
            </motion.button>
          );
        })}
      </div>

      <HomeButton onClick={onHome} />
    </div>
  );
}
