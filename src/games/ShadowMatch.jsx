import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import { ANIMALS, BIRDS, VEHICLES } from "../data/scenes.js";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Match the picture to its shadow.
 *
 * Good early visual reasoning: it forces attention to *silhouette* — outline
 * and proportion — rather than to colour, which is how children usually sort
 * things first.
 *
 * The shadow is the same emoji rendered as a flat dark shape with a CSS
 * brightness(0) filter. That guarantees the silhouette matches the picture
 * exactly, which hand-drawn shadow art almost never does, and costs nothing.
 */

const CHOICES = 3;
const PRAISE = ["That's it!", "Well spotted!", "Yes!", "Clever girl!"];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeRound() {
  // One category per round: silhouettes of a lion and a bus differ so wildly
  // that mixing them makes the puzzle trivial.
  const set = pickOne([ANIMALS, BIRDS, VEHICLES]);
  const tiles = shuffle(set).slice(0, CHOICES);
  return {
    id: Math.random().toString(36).slice(2),
    target: pickOne(tiles),
    tiles: shuffle(tiles),
  };
}

export default function ShadowMatch({ onHome }) {
  const [round, setRound] = useState(makeRound);
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
    const t = setTimeout(() => speak("Which one makes this shadow?"), 400);
    return () => clearTimeout(t);
  }, [round]);

  const tap = (tile) => {
    if (wonId) return;

    if (tile.id === round.target.id) {
      playSfx("chime");
      vibrate(40);
      setWonId(tile.id);
      after(150, () => speak(`${pickOne(PRAISE)} ${tile.label}!`));
      after(2100, () => {
        setWonId(null);
        setRound(makeRound());
      });
    } else {
      playSfx("soft");
      setWobbleId(tile.id);
      after(450, () => setWobbleId(null));
      after(750, () => speak("Try again"));
    }
  };

  return (
    <GameShell title="Shadows" tone="think" onHome={onHome}>
      <div className="sm-stage">
        <motion.button
          type="button"
          className="sm-shadow tappable"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          onPointerDown={() => speak("Which one makes this shadow?")}
          onClick={(e) => e.preventDefault()}
          aria-label="The shadow. Tap to hear the question again"
        >
          <span className="sm-shadow-emoji">{round.target.emoji}</span>
        </motion.button>

        <div className="sm-choices" key={round.id}>
          {round.tiles.map((tile) => {
            const won = wonId === tile.id;
            const wobbling = wobbleId === tile.id;
            return (
              <motion.button
                key={tile.id}
                type="button"
                className={`sm-choice tappable${won ? " is-won" : ""}`}
                style={{ "--tile-color": tile.color }}
                animate={
                  won
                    ? { scale: [1, 1.18, 1.06], rotate: [0, 6, -6, 0] }
                    : wobbling
                      ? { x: [0, -10, 10, -6, 0] }
                      : { scale: 1, x: 0, rotate: 0 }
                }
                transition={{ duration: won ? 0.6 : 0.4, ease: "easeOut" }}
                onPointerDown={() => tap(tile)}
                onClick={(e) => e.preventDefault()}
                aria-label={tile.label}
              >
                <span className="sm-choice-emoji">{tile.emoji}</span>
                {won && <Sparkles count={12} distance={110} />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
