import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import {
  NOTES,
  playNote,
  playSfx,
  speak,
  stopSpeech,
  vibrate,
} from "../audio/audioManager.js";

/**
 * Copy the tune — the gentlest possible memory game.
 *
 * A wrong tap replays the same sequence and lets the child try again. There is
 * no "game over", no lives, no score, and the sequence never shrinks as a
 * punishment. The worst outcome is hearing a nice tune a second time.
 *
 * The four pads are tuned to a pentatonic scale, so any order of taps sounds
 * pleasant — including a toddler hammering all four at once.
 */

const PADS = [
  { id: 0, emoji: "🐸", color: "#43aa8b", note: NOTES.C4 },
  { id: 1, emoji: "🐤", color: "#f4d35e", note: NOTES.E4 },
  { id: 2, emoji: "🐙", color: "#9d4edd", note: NOTES.G4 },
  { id: 3, emoji: "🐠", color: "#457b9d", note: NOTES.C5 },
];

const START_LENGTH = 2;
const MAX_LENGTH = 5;

const STEP_MS = 750; // gap between notes when demonstrating
const LIT_MS = 480; // how long a pad stays lit

const randomPad = () => Math.floor(Math.random() * PADS.length);

export default function CopyTune({ onHome }) {
  const [sequence, setSequence] = useState(() =>
    Array.from({ length: START_LENGTH }, randomPad),
  );
  const [phase, setPhase] = useState("watch"); // watch | play | celebrate
  const [litPad, setLitPad] = useState(null);
  const [childIndex, setChildIndex] = useState(0);
  const [burst, setBurst] = useState(0);

  // Timeouts are tracked centrally: the child can hit Home mid-sequence, and
  // a stray timer firing after unmount would light a pad that no longer exists.
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

  /** Demonstrate a sequence, then hand control to the child. */
  const demonstrate = useCallback(
    (seq) => {
      clearTimers();
      setPhase("watch");
      setChildIndex(0);
      setLitPad(null);

      seq.forEach((padId, i) => {
        after(600 + i * STEP_MS, () => {
          setLitPad(padId);
          playNote(PADS[padId].note);
        });
        after(600 + i * STEP_MS + LIT_MS, () => setLitPad(null));
      });

      after(600 + seq.length * STEP_MS + 200, () => setPhase("play"));
    },
    [after, clearTimers],
  );

  // Kick off on mount and whenever the sequence changes.
  useEffect(() => {
    demonstrate(sequence);
    return clearTimers;
  }, [sequence, demonstrate, clearTimers]);

  const flash = (padId) => {
    setLitPad(padId);
    after(LIT_MS, () => setLitPad((cur) => (cur === padId ? null : cur)));
  };

  const handleTap = (pad) => {
    // Rule 2: never a dead tap. Even while the tune is playing or during a
    // celebration, touching a pad lights it and sounds its note — it just
    // doesn't advance the sequence.
    playNote(pad.note);
    flash(pad.id);
    vibrate(20);

    if (phase !== "play") return;

    if (pad.id === sequence[childIndex]) {
      const next = childIndex + 1;

      if (next === sequence.length) {
        // Whole sequence repeated back.
        setPhase("celebrate");
        setBurst((n) => n + 1);
        playSfx("celebrate");
        after(200, () => speak("You did it!"));

        after(2000, () => {
          // Grow by one, up to the cap. At the cap, start a fresh tune rather
          // than making it endlessly harder.
          setSequence((prev) =>
            prev.length < MAX_LENGTH
              ? [...prev, randomPad()]
              : Array.from({ length: START_LENGTH }, randomPad),
          );
        });
      } else {
        setChildIndex(next);
      }
      return;
    }

    // Wrong pad. Not a loss — just play the tune again.
    setPhase("watch");
    playSfx("soft");
    after(400, () => speak("Listen again"));
    after(1400, () => demonstrate(sequence));
  };

  return (
    <GameShell title="Copy me" tone="think" onHome={onHome}>
      <div className="ct-status" aria-live="polite">
        <motion.span
          key={phase}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          {phase === "watch" ? "👀" : phase === "play" ? "👆" : "🎉"}
        </motion.span>
      </div>

      <div className="ct-grid">
        {PADS.map((pad) => {
          const lit = litPad === pad.id;
          return (
            <motion.button
              key={pad.id}
              type="button"
              className={`ct-pad tappable${lit ? " is-lit" : ""}`}
              style={{ "--pad-color": pad.color }}
              animate={{ scale: lit ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              onPointerDown={() => handleTap(pad)}
              onClick={(e) => e.preventDefault()}
              aria-label={`Pad ${pad.id + 1}`}
            >
              <span className="ct-pad-emoji">{pad.emoji}</span>
            </motion.button>
          );
        })}
      </div>

      {phase === "celebrate" && burst > 0 && (
        <div className="ct-celebration">
          <Sparkles key={burst} count={16} distance={180} />
        </div>
      )}

      {/* Replay the tune on demand — a child who lost track is never stuck. */}
      <button
        type="button"
        className="ct-replay tappable"
        onPointerDown={() => phase !== "watch" && demonstrate(sequence)}
        onClick={(e) => e.preventDefault()}
        aria-label="Play the tune again"
      >
        🔊
      </button>

    </GameShell>
  );
}
