import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playSfx } from "../audio/audioManager.js";

/**
 * Blocks a child from reaching anything outside the play area.
 *
 * Two stages, both required:
 *   1. Press and hold for 3 seconds (filling ring).
 *   2. Answer an arithmetic question WRITTEN IN WORDS.
 *
 * Either alone is weak. A 3-year-old rests a finger on the screen for three
 * seconds constantly, and six answer choices means one-in-six odds for a hand
 * mashing the screen. Together they are effectively impossible by accident,
 * while a grown-up clears both in about five seconds.
 *
 * Spelling the numbers out is the actual lock: a pre-reader cannot parse
 * "three plus four", regardless of how well they tap.
 *
 * Auto-dismisses after 12 s of no interaction, so a wandered-off child leaves
 * the app sitting on the play screen rather than on an open door.
 */

const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

const HOLD_MS = 3000;
const IDLE_DISMISS_MS = 12000;

function makeQuestion() {
  const a = 2 + Math.floor(Math.random() * 6); // 2..7
  const b = 2 + Math.floor(Math.random() * 5); // 2..6
  const answer = a + b;

  const choices = new Set([answer]);
  while (choices.size < 6) {
    const noise = answer + (Math.floor(Math.random() * 9) - 4);
    if (noise > 0 && noise !== answer) choices.add(noise);
  }

  return {
    prompt: `What is ${WORDS[a]} plus ${WORDS[b]}?`,
    answer,
    choices: [...choices].sort(() => Math.random() - 0.5),
  };
}

export default function ParentGate({ onUnlocked, onDismiss }) {
  const [stage, setStage] = useState("hold"); // "hold" | "question"
  const [progress, setProgress] = useState(0); // 0..1
  const [question, setQuestion] = useState(makeQuestion);
  const [shake, setShake] = useState(0);

  const rafRef = useRef(0);
  const startedAtRef = useRef(0);
  const idleTimerRef = useRef(0);

  // --- auto-dismiss on inactivity ------------------------------------------
  const pokeIdleTimer = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(onDismiss, IDLE_DISMISS_MS);
  }, [onDismiss]);

  useEffect(() => {
    pokeIdleTimer();
    return () => clearTimeout(idleTimerRef.current);
  }, [pokeIdleTimer]);

  // --- stage 1: hold --------------------------------------------------------
  const stopHold = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setProgress(0);
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startedAtRef.current;
    const p = Math.min(elapsed / HOLD_MS, 1);
    setProgress(p);

    if (p >= 1) {
      rafRef.current = 0;
      playSfx("chime");
      setQuestion(makeQuestion());
      setStage("question");
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startHold = useCallback(() => {
    pokeIdleTimer();
    startedAtRef.current = Date.now();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [pokeIdleTimer, tick]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // --- stage 2: question ----------------------------------------------------
  const answerTapped = (value) => {
    pokeIdleTimer();
    if (value === question.answer) {
      playSfx("chime");
      onUnlocked();
    } else {
      // No scolding, no error sound — just a shake and a fresh question.
      setShake((n) => n + 1);
      setQuestion(makeQuestion());
    }
  };

  // Ring geometry.
  const R = 54;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="gate-backdrop" onPointerDown={pokeIdleTimer}>
      <motion.div
        className="gate-card"
        key={shake}
        initial={shake ? { x: -10 } : false}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 12 }}
      >
        <p className="gate-title">Grown-ups only</p>

        {stage === "hold" ? (
          <>
            <p className="gate-instructions">Press and hold for 3 seconds</p>
            <button
              type="button"
              className="gate-hold tappable"
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              aria-label="Press and hold for three seconds"
            >
              <svg className="gate-ring" viewBox="0 0 130 130" aria-hidden="true">
                <circle className="gate-ring-track" cx="65" cy="65" r={R} />
                <circle
                  className="gate-ring-fill"
                  cx="65"
                  cy="65"
                  r={R}
                  style={{
                    strokeDasharray: CIRC,
                    strokeDashoffset: CIRC * (1 - progress),
                  }}
                />
              </svg>
              <span className="gate-hold-icon">🔒</span>
            </button>
          </>
        ) : (
          <>
            <p className="gate-instructions">{question.prompt}</p>
            <div className="gate-choices">
              {question.choices.map((n) => (
                <button
                  key={n}
                  type="button"
                  className="gate-choice tappable"
                  onPointerDown={() => answerTapped(n)}
                  onClick={(e) => e.preventDefault()}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          className="gate-cancel tappable"
          onPointerDown={onDismiss}
          onClick={(e) => e.preventDefault()}
          aria-label="Go back"
        >
          ← Back to play
        </button>
      </motion.div>
    </div>
  );
}
