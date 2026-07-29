import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * "What comes next?"
 *
 * Sequencing is the root of both early maths and reading, and an ABAB pattern
 * is the first form of it a 3-year-old can hold.
 *
 * Only ABAB and AABB are used — ABC repeats need a longer working memory than
 * three-year-olds have, and a pattern she cannot see is just a guess.
 *
 * The sequence is shown four items long plus a question mark, which is short
 * enough to scan in one look.
 */

const SETS = [
  ["🍎", "🍌"],
  ["⭐", "🌙"],
  ["🐶", "🐱"],
  ["🔴", "🔵"],
  ["🌸", "🍀"],
  ["🚗", "🚌"],
  ["🐟", "🐙"],
  ["☀️", "☁️"],
];

const RULES = [
  { id: "abab", build: (a, b) => [a, b, a, b], answer: (a) => a },
  { id: "aabb", build: (a, b) => [a, a, b, b], answer: (_, b) => b },
];

const PRAISE = ["That's it!", "Well done!", "Yes!", "Clever girl!"];

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function makeRound() {
  const [a, b] = pickOne(SETS);
  const rule = pickOne(RULES);
  const answer = rule.answer(a, b);

  // Distractors come from OTHER sets plus the non-answer of this one, so a
  // wrong choice is always visibly wrong rather than a coin flip.
  const others = shuffle(SETS.flat().filter((e) => e !== a && e !== b)).slice(0, 1);
  const choices = shuffle([answer, answer === a ? b : a, ...others]);

  return {
    id: Math.random().toString(36).slice(2),
    sequence: rule.build(a, b),
    answer,
    choices,
  };
}

export default function Patterns({ onHome }) {
  const [round, setRound] = useState(makeRound);
  const [won, setWon] = useState(false);
  const [wobble, setWobble] = useState(null);

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
    const t = setTimeout(() => speak("What comes next?"), 400);
    return () => clearTimeout(t);
  }, [round]);

  const tap = (choice, i) => {
    if (won) return;

    if (choice === round.answer) {
      playSfx("chime");
      vibrate(40);
      setWon(true);
      after(180, () => speak(pickOne(PRAISE)));
      after(2000, () => {
        setWon(false);
        setRound(makeRound());
      });
    } else {
      playSfx("soft");
      setWobble(i);
      after(450, () => setWobble(null));
      after(700, () => speak("What comes next?"));
    }
  };

  return (
    <GameShell title="Patterns" tone="think" onHome={onHome}>
      <div className="pt-sequence" key={round.id}>
        {round.sequence.map((e, i) => (
          <motion.span
            key={i}
            className="pt-cell"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.09, duration: 0.28 }}
          >
            {e}
          </motion.span>
        ))}

        <motion.span
          className={`pt-cell pt-slot${won ? " is-filled" : ""}`}
          animate={won ? { scale: [1, 1.25, 1.1] } : { scale: [1, 1.08, 1] }}
          transition={
            won
              ? { duration: 0.5, ease: "easeOut" }
              : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {won ? round.answer : "?"}
          {won && <Sparkles count={12} distance={100} />}
        </motion.span>
      </div>

      <button
        type="button"
        className="pt-ask tappable"
        onPointerDown={() => speak("What comes next?")}
        onClick={(e) => e.preventDefault()}
        aria-label="Say the question again"
      >
        🔊
      </button>

      <div className="pt-choices">
        {round.choices.map((c, i) => (
          <motion.button
            key={`${round.id}-${i}`}
            type="button"
            className="pt-choice tappable"
            animate={wobble === i ? { x: [0, -10, 10, -6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            whileTap={{ scale: 0.94 }}
            onPointerDown={() => tap(c, i)}
            onClick={(e) => e.preventDefault()}
            aria-label={`Choice ${i + 1}`}
          >
            {c}
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}
