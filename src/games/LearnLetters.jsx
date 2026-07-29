import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Deck from "../components/Deck.jsx";
import Sparkles from "../components/Sparkles.jsx";
import LETTERS from "../data/letters.js";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * A to Z, one card at a time.
 *
 * Says the letter, then the word: "A. A is for Apple." The letter comes first
 * and alone, with a pause, because the letter is the thing being taught — run
 * together as one phrase a 3-year-old hears only "aysforapple".
 *
 * Both cases are shown (A a). Children meet lowercase far more often in real
 * books, but nearly every alphabet toy teaches uppercase only.
 *
 * No quiz, no score, no wrong answer — this screen is for browsing.
 */
export default function LearnLetters({ onHome }) {
  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(0);
  const timers = useRef([]);

  const card = LETTERS[index];

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

  /** "A" ... "A is for Apple." */
  const announce = useCallback(
    (item) => {
      clearTimers();
      speak(item.letter);
      // speak() cancels whatever is mid-sentence, so the second phrase has to
      // wait for the first to finish rather than being queued.
      after(900, () => speak(`${item.letter} is for ${item.word}`));
    },
    [after, clearTimers],
  );

  // Announce whenever the card changes, including on first mount.
  useEffect(() => {
    const t = setTimeout(() => announce(LETTERS[index]), 250);
    return () => clearTimeout(t);
  }, [index, announce]);

  // Wrap in both directions: no first or last card to get stuck on.
  const go = (delta) =>
    setIndex((i) => (i + delta + LETTERS.length) % LETTERS.length);

  const tapCard = () => {
    playSfx("pop");
    vibrate(25);
    setBurst((n) => n + 1);
    announce(card);
  };

  return (
    <Deck
      className="learn-letters"
      onPrev={() => go(-1)}
      onNext={() => go(1)}
      onReplay={() => announce(card)}
      onHome={onHome}
    >
      <AnimatePresence mode="wait">
        <motion.button
          key={card.letter}
          type="button"
          className="letter-card tappable"
          style={{ "--tile-color": card.color }}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onPointerDown={tapCard}
          onClick={(e) => e.preventDefault()}
          aria-label={`${card.letter} is for ${card.word}`}
        >
          <span className="letter-glyph">
            {card.letter}
            <span className="letter-lower">{card.letter.toLowerCase()}</span>
          </span>

          <span className="letter-emoji">{card.emoji}</span>
          <span className="letter-word">{card.word}</span>

          {burst > 0 && <Sparkles key={burst} count={10} distance={130} />}
        </motion.button>
      </AnimatePresence>
    </Deck>
  );
}
