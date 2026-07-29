import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GameShell from "../ui/GameShell.jsx";
import { NOTES, playNote, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * A toy piano.
 *
 * Tuned to a **C major pentatonic scale**, not a chromatic keyboard. There are
 * no semitones in it, so no combination of keys can sound wrong — a toddler
 * hammering all eight at once produces a chord, not a clash. That single choice
 * is what makes free play here pleasant for everyone in the room instead of
 * something a parent switches off after ninety seconds.
 *
 * Each key also carries an animal, and a long-ish press speaks its name, so
 * it doubles as another naming surface.
 */

const KEYS = [
  { id: "c4", note: NOTES.C4, emoji: "🐘", label: "Elephant", tone: "#ef8b7a" },
  { id: "d4", note: NOTES.D4, emoji: "🦁", label: "Lion", tone: "#f5a742" },
  { id: "e4", note: NOTES.E4, emoji: "🐒", label: "Monkey", tone: "#f7cb45" },
  { id: "g4", note: NOTES.G4, emoji: "🐸", label: "Frog", tone: "#63c98a" },
  { id: "a4", note: NOTES.A4, emoji: "🐬", label: "Dolphin", tone: "#4fb8e8" },
  { id: "c5", note: NOTES.C5, emoji: "🐧", label: "Penguin", tone: "#5b8ce0" },
  { id: "d5", note: NOTES.D5, emoji: "🦋", label: "Butterfly", tone: "#a888e8" },
  { id: "e5", note: NOTES.E5, emoji: "🐤", label: "Chick", tone: "#f08fb0" },
];

export default function Piano({ onHome }) {
  const [lit, setLit] = useState(null);
  const timers = useRef([]);
  const lastSpokeAt = useRef(0);

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

  const press = (key) => {
    playNote(key.note, 0.6);
    vibrate(18);
    setLit(key.id);
    after(260, () => setLit((cur) => (cur === key.id ? null : cur)));

    // Naming every key would talk over the music. Name occasionally, so the
    // words land without the instrument becoming a lecture.
    const now = Date.now();
    if (now - lastSpokeAt.current > 2600) {
      lastSpokeAt.current = now;
      after(340, () => speak(key.label));
    }
  };

  return (
    <GameShell title="Piano" tone="create" onHome={onHome}>
      <div className="piano">
        {KEYS.map((key, i) => (
          <motion.button
            key={key.id}
            type="button"
            className={`piano-key tappable${lit === key.id ? " is-lit" : ""}`}
            style={{ "--key-color": key.tone }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scaleY: 0.95 }}
            onPointerDown={() => press(key)}
            onClick={(e) => e.preventDefault()}
            aria-label={`${key.label} key`}
          >
            <span className="piano-emoji">{key.emoji}</span>
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}
