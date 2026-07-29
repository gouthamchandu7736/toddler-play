import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Opposites: "big — what is the opposite?"
 *
 * Opposite pairs are how young children first learn that words come in
 * relationships rather than as isolated labels, and it is a large step up in
 * vocabulary from naming objects.
 *
 * Every pair is chosen to be visible in a picture. "Kind/unkind" is a real
 * opposite but not a drawable one, and a picture she has to have explained is
 * worse than no picture.
 */

const PAIRS = [
  { a: { word: "Big", emoji: "🐘" }, b: { word: "Small", emoji: "🐜" } },
  { a: { word: "Hot", emoji: "🔥" }, b: { word: "Cold", emoji: "❄️" } },
  { a: { word: "Day", emoji: "☀️" }, b: { word: "Night", emoji: "🌙" } },
  { a: { word: "Happy", emoji: "😀" }, b: { word: "Sad", emoji: "😢" } },
  { a: { word: "Up", emoji: "⬆️" }, b: { word: "Down", emoji: "⬇️" } },
  { a: { word: "Wet", emoji: "💧" }, b: { word: "Dry", emoji: "🏜️" } },
  { a: { word: "Fast", emoji: "🐆" }, b: { word: "Slow", emoji: "🐌" } },
  { a: { word: "Full", emoji: "🍚" }, b: { word: "Empty", emoji: "🍽️" } },
  { a: { word: "Open", emoji: "🚪" }, b: { word: "Closed", emoji: "🔒" } },
  { a: { word: "Loud", emoji: "📢" }, b: { word: "Quiet", emoji: "🤫" } },
];

const PRAISE = ["That's it!", "Well done!", "Yes!", "Clever girl!"];

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function makeRound(previousWord) {
  const pool = PAIRS.filter((p) => p.a.word !== previousWord);
  const pair = pickOne(pool.length ? pool : PAIRS);

  // Ask from either end of the pair, so "big" isn't always the prompt.
  const flip = Math.random() < 0.5;
  const prompt = flip ? pair.b : pair.a;
  const answer = flip ? pair.a : pair.b;

  // Distractors come from other pairs — they must be plausible pictures, not
  // obviously unrelated ones, or the answer is findable without knowing it.
  const others = shuffle(PAIRS.filter((p) => p !== pair))
    .slice(0, 2)
    .map((p) => (Math.random() < 0.5 ? p.a : p.b));

  return {
    id: Math.random().toString(36).slice(2),
    prompt,
    answer,
    choices: shuffle([answer, ...others]),
  };
}

export default function Opposites({ onHome }) {
  const [round, setRound] = useState(() => makeRound(null));
  const [won, setWon] = useState(null);
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

  const ask = useCallback(
    (r) => speak(`${r.prompt.word}. What is the opposite of ${r.prompt.word.toLowerCase()}?`),
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => ask(round), 420);
    return () => clearTimeout(t);
  }, [round, ask]);

  const tap = (choice) => {
    if (won) return;

    if (choice.word === round.answer.word) {
      playSfx("chime");
      vibrate(40);
      setWon(choice.word);
      after(160, () =>
        speak(`${pickOne(PRAISE)} ${round.prompt.word} and ${choice.word}.`),
      );
      after(2300, () => {
        setWon(null);
        setRound((prev) => makeRound(prev.prompt.word));
      });
    } else {
      playSfx("soft");
      setWobble(choice.word);
      after(450, () => setWobble(null));
      after(750, () => ask(round));
    }
  };

  return (
    <GameShell title="Opposites" tone="learn" onHome={onHome}>
      <motion.button
        type="button"
        className="op-prompt tappable"
        onPointerDown={() => ask(round)}
        onClick={(e) => e.preventDefault()}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        aria-label={`${round.prompt.word}. Tap to hear the question again`}
      >
        <span className="op-emoji">{round.prompt.emoji}</span>
        <span className="op-word">{round.prompt.word}</span>
      </motion.button>

      <span className="op-vs" aria-hidden="true">↔</span>

      <div className="op-choices" key={round.id}>
        {round.choices.map((c) => {
          const isWon = won === c.word;
          return (
            <motion.button
              key={c.word}
              type="button"
              className={`op-choice tappable${isWon ? " is-won" : ""}`}
              animate={
                isWon
                  ? { scale: [1, 1.18, 1.06] }
                  : wobble === c.word
                    ? { x: [0, -10, 10, -6, 0] }
                    : { scale: 1, x: 0 }
              }
              transition={{ duration: isWon ? 0.55 : 0.4, ease: "easeOut" }}
              onPointerDown={() => tap(c)}
              onClick={(e) => e.preventDefault()}
              aria-label={c.word}
            >
              <span className="op-emoji">{c.emoji}</span>
              <span className="op-word">{c.word}</span>
              {isWon && <Sparkles count={12} distance={100} />}
            </motion.button>
          );
        })}
      </div>
    </GameShell>
  );
}
