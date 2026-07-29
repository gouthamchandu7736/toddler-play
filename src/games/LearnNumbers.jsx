import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Deck from "../components/Deck.jsx";
import NUMBERS from "../data/numbers.js";
import {
  NOTES,
  playNote,
  playSfx,
  speak,
  stopSpeech,
  vibrate,
} from "../audio/audioManager.js";

/**
 * 1 to 10, counted out loud and one object at a time.
 *
 * The teaching point is **one-to-one correspondence** — that "three" means
 * exactly three things — not reciting the number names, which most 3-year-olds
 * can chant long before it means anything. So the count is not a spoken list:
 * each object lights up, plays a rising note, and is named as it is touched.
 *
 * Tapping an individual object also says its position, so she can count at her
 * own pace instead of watching the animation.
 */

const COUNT_WORDS = [
  "One", "Two", "Three", "Four", "Five",
  "Six", "Seven", "Eight", "Nine", "Ten",
];

/** Rising pitch per item, so the count sounds like it is going somewhere. */
const SCALE = [
  NOTES.C4, NOTES.D4, NOTES.E4, NOTES.G4, NOTES.A4,
  NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5, NOTES.C6,
];

const STEP_MS = 800; // slow — a toddler needs time to follow each object

export default function LearnNumbers({ onHome }) {
  const [index, setIndex] = useState(0);
  const [litUpTo, setLitUpTo] = useState(-1); // highest index counted so far

  const timers = useRef([]);
  const card = NUMBERS[index];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms, fn) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      stopSpeech();
    };
  }, [clearTimers]);

  /** Light and name each object in turn, then say the total. */
  const countAloud = useCallback(
    (item) => {
      clearTimers();
      setLitUpTo(-1);

      for (let i = 0; i < item.value; i += 1) {
        after(i * STEP_MS, () => {
          setLitUpTo(i);
          playNote(SCALE[i], 0.3);
          speak(COUNT_WORDS[i]);
        });
      }

      after(item.value * STEP_MS + 250, () => {
        playSfx("chime");
        // "…that's three apples" — ties the count back to the quantity.
        speak(`That's ${item.word.toLowerCase()}`);
      });
    },
    [after, clearTimers],
  );

  useEffect(() => {
    const t = setTimeout(() => countAloud(NUMBERS[index]), 300);
    return () => clearTimeout(t);
  }, [index, countAloud]);

  const go = (delta) =>
    setIndex((i) => (i + delta + NUMBERS.length) % NUMBERS.length);

  /** Tapping one object names its position — counting at her own pace. */
  const tapItem = (i) => {
    clearTimers(); // she has taken over; stop the automatic count
    playNote(SCALE[i], 0.3);
    vibrate(20);
    setLitUpTo(i);
    speak(COUNT_WORDS[i]);
  };

  return (
    <Deck
      title="Numbers"
      tone="learn"
      className="learn-numbers"
      onPrev={() => go(-1)}
      onNext={() => go(1)}
      onReplay={() => countAloud(card)}
      onHome={onHome}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={card.value}
          className="number-card"
          style={{ "--tile-color": card.color }}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="number-glyph">
            <span className="number-digit">{card.value}</span>
            <span className="number-word">{card.word}</span>
          </div>

          {/* Objects wrap into as many rows as the screen needs (see
              .number-items) rather than being squeezed into fixed columns —
              on a small phone that shrank them below a hittable size. */}
          <div className="number-items">
            {Array.from({ length: card.value }).map((_, i) => (
              <motion.button
                key={i}
                type="button"
                className={`number-item tappable${i <= litUpTo ? " is-lit" : ""}`}
                animate={{ scale: i <= litUpTo ? 1.14 : 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 15 }}
                onPointerDown={() => tapItem(i)}
                onClick={(e) => e.preventDefault()}
                aria-label={`${COUNT_WORDS[i]}`}
              >
                {card.emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </Deck>
  );
}
