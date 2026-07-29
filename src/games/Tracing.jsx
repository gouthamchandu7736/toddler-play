import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Deck from "../components/Deck.jsx";
import Sparkles from "../components/Sparkles.jsx";
import TRACING, { dotsForStroke } from "../data/tracing.js";
import { NOTES, playNote, playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Letter tracing, by tapping dots in order.
 *
 * Real tracing means dragging a finger along the letter — and this app cancels
 * every `touchmove` so a toddler cannot swipe her way out of the play area.
 * Tapping numbered dots in sequence teaches the same thing that actually
 * matters at three: **stroke order and direction**. Where the pencil starts
 * and which way it travels is the part children get wrong for years; staying
 * on the line is motor control that comes later anyway.
 *
 * Only the NEXT dot is active. Tapping anywhere else does nothing harmful —
 * the next dot just pulses to show where to go.
 */

const NOTE_LADDER = [
  NOTES.C4, NOTES.D4, NOTES.E4, NOTES.G4, NOTES.A4,
  NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5, NOTES.C6,
];

export default function Tracing({ onHome }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0); // how many dots are done
  const [nudge, setNudge] = useState(0);
  const [done, setDone] = useState(false);

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

  const card = TRACING[index];

  /**
   * Flatten every stroke into one ordered dot list, remembering which stroke a
   * dot belongs to so the drawn line can break between strokes rather than
   * joining the end of one to the start of the next.
   */
  const dots = useMemo(() => {
    const all = [];
    card.strokes.forEach((stroke, s) => {
      dotsForStroke(stroke).forEach((p, i) => {
        all.push({ ...p, stroke: s, firstOfStroke: i === 0 });
      });
    });
    return all;
  }, [card]);

  // Reset and announce whenever the letter changes.
  useEffect(() => {
    clearTimers();
    setStep(0);
    setDone(false);
    const t = setTimeout(() => speak(`${card.letter}. Follow the dots.`), 320);
    return () => clearTimeout(t);
  }, [card, clearTimers]);

  const tapDot = (i) => {
    if (done) return;

    if (i !== step) {
      // Wrong dot: no penalty, no error sound — just point at the right one.
      playSfx("soft");
      setNudge((n) => n + 1);
      return;
    }

    playNote(NOTE_LADDER[Math.min(i, NOTE_LADDER.length - 1)], 0.22);
    vibrate(15);
    const next = i + 1;
    setStep(next);

    if (next === dots.length) {
      setDone(true);
      playSfx("celebrate");
      after(220, () => speak(`${card.letter} is for ${card.word}!`));
    }
  };

  const go = (delta) =>
    setIndex((i) => (i + delta + TRACING.length) % TRACING.length);

  const reset = () => {
    clearTimers();
    setStep(0);
    setDone(false);
    playSfx("woosh");
    speak(`${card.letter}. Follow the dots.`);
  };

  // Completed segments, split per stroke so separate strokes never join up.
  const segments = [];
  for (let i = 1; i < Math.min(step, dots.length); i += 1) {
    if (dots[i].firstOfStroke) continue;
    segments.push({ a: dots[i - 1], b: dots[i], key: `${i}` });
  }

  return (
    <Deck
      title="Tracing"
      tone="learn"
      className="tracing"
      onPrev={() => go(-1)}
      onNext={() => go(1)}
      onReplay={reset}
      onHome={onHome}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={card.letter}
          className="tr-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tr-head">
            <span className="tr-letter">
              {card.letter}
              <span className="tr-lower">{card.letter.toLowerCase()}</span>
            </span>
            <span className="tr-word">
              <span className="tr-emoji">{card.emoji}</span>
              {card.word}
            </span>
          </div>

          <svg className="tr-canvas" viewBox="0 0 200 206" role="img"
            aria-label={`Trace the letter ${card.letter}`}>
            {/* Ghost of the finished letter, so she can see where it goes. */}
            {card.strokes.map((stroke, s) => (
              <polyline
                key={`g${s}`}
                className="tr-ghost"
                points={stroke.map((p) => p.join(",")).join(" ")}
              />
            ))}

            {segments.map((seg) => (
              <line
                key={seg.key}
                className="tr-drawn"
                x1={seg.a.x} y1={seg.a.y} x2={seg.b.x} y2={seg.b.y}
              />
            ))}

            {dots.map((d, i) => {
              const isDone = i < step;
              const isNext = i === step && !done;
              return (
                <g key={i}>
                  {/*
                    Only the NEXT dot gets a big hit circle. Giving every dot
                    one meant neighbours overlapped, and since a later sibling
                    paints on top, a tap aimed at the active dot could land on
                    the one after it and do nothing. Sizing by state removes
                    the overlap and puts the largest target exactly where she
                    is being asked to tap.
                  */}
                  <circle
                    className="tr-hit"
                    cx={d.x} cy={d.y} r={isNext ? 30 : 12}
                    onPointerDown={() => tapDot(i)}
                    aria-label={`Dot ${i + 1}`}
                  />
                  <circle
                    className={`tr-dot${isDone ? " is-done" : ""}${isNext ? " is-next" : ""}`}
                    cx={d.x} cy={d.y} r={isNext ? 9 : 7}
                  />
                  {isNext && (
                    <circle className="tr-pulse" cx={d.x} cy={d.y} r="9"
                      key={`p${nudge}`} />
                  )}
                </g>
              );
            })}
          </svg>

          {done && <Sparkles count={16} distance={150} />}
        </motion.div>
      </AnimatePresence>
    </Deck>
  );
}
