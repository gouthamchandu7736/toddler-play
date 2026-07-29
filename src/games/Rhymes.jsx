import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameShell from "../ui/GameShell.jsx";
import Button from "../ui/Button.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Nursery rhymes, read aloud line by line.
 *
 * All six are traditional and long out of copyright.
 *
 * Each line is spoken as its own utterance rather than the whole verse at once,
 * because `speak()` cancels whatever is mid-sentence — a single long utterance
 * could not be highlighted in sync, and any tap would kill the whole rhyme
 * instead of just the current line. Line-by-line also lets the current line
 * light up as it is read, which is a child's first exposure to text tracking
 * left-to-right.
 *
 * Tapping a line reads that line. She can stay on "twinkle twinkle" for as
 * long as she likes.
 */

const RHYMES = [
  {
    id: "twinkle",
    title: "Twinkle Twinkle",
    emoji: "⭐",
    tone: "#8fb8f0",
    lines: [
      "Twinkle, twinkle, little star,",
      "How I wonder what you are.",
      "Up above the world so high,",
      "Like a diamond in the sky.",
    ],
  },
  {
    id: "baabaa",
    title: "Baa Baa Black Sheep",
    emoji: "🐑",
    tone: "#c9c6d8",
    lines: [
      "Baa, baa, black sheep, have you any wool?",
      "Yes sir, yes sir, three bags full.",
      "One for the master, one for the dame,",
      "And one for the little boy who lives down the lane.",
    ],
  },
  {
    id: "spider",
    title: "Incy Wincy Spider",
    emoji: "🕷️",
    tone: "#a9d8b8",
    lines: [
      "Incy Wincy spider climbed up the water spout.",
      "Down came the rain and washed the spider out.",
      "Out came the sunshine and dried up all the rain,",
      "So Incy Wincy spider climbed up the spout again.",
    ],
  },
  {
    id: "star-duck",
    title: "Five Little Ducks",
    emoji: "🦆",
    tone: "#f6d78a",
    lines: [
      "Five little ducks went swimming one day,",
      "Over the hills and far away.",
      "Mother duck said quack, quack, quack, quack,",
      "But only four little ducks came back.",
    ],
  },
  {
    id: "rowboat",
    title: "Row Your Boat",
    emoji: "🚣",
    tone: "#9fd6ea",
    lines: [
      "Row, row, row your boat, gently down the stream.",
      "Merrily, merrily, merrily, merrily,",
      "Life is but a dream.",
    ],
  },
  {
    id: "humpty",
    title: "Humpty Dumpty",
    emoji: "🥚",
    tone: "#f4c9a8",
    lines: [
      "Humpty Dumpty sat on a wall,",
      "Humpty Dumpty had a great fall.",
      "All the king's horses and all the king's men,",
      "Couldn't put Humpty together again.",
    ],
  },
];

/** Roughly how long a line takes to speak, so highlighting keeps pace. */
const lineDuration = (line) => 1100 + line.length * 62;

export default function Rhymes({ onHome }) {
  const [index, setIndex] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [reading, setReading] = useState(false);

  const timers = useRef([]);
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

  const rhyme = RHYMES[index];

  const readAll = useCallback(
    (r) => {
      clearTimers();
      setReading(true);
      let t = 0;
      r.lines.forEach((line, i) => {
        after(t, () => {
          setActiveLine(i);
          speak(line);
        });
        t += lineDuration(line);
      });
      after(t, () => {
        setActiveLine(-1);
        setReading(false);
        playSfx("chime");
      });
    },
    [after, clearTimers],
  );

  // Read automatically on arriving at a rhyme — she should not have to find a
  // play button to make the story start.
  useEffect(() => {
    const t = setTimeout(() => readAll(RHYMES[index]), 420);
    return () => clearTimeout(t);
  }, [index, readAll]);

  const stop = useCallback(() => {
    clearTimers();
    stopSpeech();
    setActiveLine(-1);
    setReading(false);
  }, [clearTimers]);

  const go = (delta) => {
    stop();
    setIndex((i) => (i + delta + RHYMES.length) % RHYMES.length);
  };

  const readLine = (line, i) => {
    stop();
    vibrate(15);
    setActiveLine(i);
    speak(line);
    after(lineDuration(line), () => setActiveLine((cur) => (cur === i ? -1 : cur)));
  };

  return (
    <GameShell
      title="Rhymes"
      tone="stories"
      onHome={onHome}
      right={
        <Button
          icon={reading ? "close" : "speaker"}
          shape="round"
          tone="ghost"
          size="md"
          label={reading ? "Stop reading" : "Read it again"}
          onPress={() => (reading ? stop() : readAll(rhyme))}
        />
      }
    >
      <div className="rh-stage">
        <Button
          icon="back"
          shape="round"
          tone="ghost"
          size="lg"
          label="Previous rhyme"
          sfx="woosh"
          onPress={() => go(-1)}
          className="rh-nav rh-prev"
        />

        <AnimatePresence mode="wait">
          <motion.article
            key={rhyme.id}
            className="rh-card"
            style={{ "--tile-color": rhyme.tone }}
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="rh-emoji"
              animate={reading ? { scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] } : { scale: 1 }}
              transition={{ duration: 2.2, repeat: reading ? Infinity : 0, ease: "easeInOut" }}
            >
              {rhyme.emoji}
            </motion.span>

            <h2 className="rh-title">{rhyme.title}</h2>

            <div className="rh-lines">
              {rhyme.lines.map((line, i) => (
                <button
                  key={i}
                  type="button"
                  className={`rh-line tappable${activeLine === i ? " is-active" : ""}`}
                  onPointerDown={() => readLine(line, i)}
                  onClick={(e) => e.preventDefault()}
                >
                  {line}
                </button>
              ))}
            </div>
          </motion.article>
        </AnimatePresence>

        <Button
          icon="next"
          shape="round"
          tone="ghost"
          size="lg"
          label="Next rhyme"
          sfx="woosh"
          onPress={() => go(1)}
          className="rh-nav rh-next"
        />
      </div>
    </GameShell>
  );
}
