import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GameShell from "../ui/GameShell.jsx";
import { playDrum, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * A drum kit.
 *
 * Percussion is the one instrument where a toddler's natural instinct —
 * hitting things as hard and as often as possible — is exactly correct
 * technique. Nothing here can be played wrong.
 *
 * Sounds are synthesised (filtered noise bursts and pitched sweeps, see
 * audioManager) rather than sampled: no audio files to load, license or
 * precache, and it works identically offline.
 *
 * Each pad flashes a ripple on hit so there is a visual answer even with the
 * sound off.
 */

const PADS = [
  { id: "kick", drum: "kick", emoji: "🥁", label: "Drum", color: "#ef8b7a" },
  { id: "snare", drum: "snare", emoji: "🪘", label: "Snare", color: "#f5a742" },
  { id: "tomHigh", drum: "tomHigh", emoji: "🎯", label: "High tom", color: "#f7cb45" },
  { id: "tomLow", drum: "tomLow", emoji: "🛢️", label: "Low tom", color: "#63c98a" },
  { id: "hat", drum: "hat", emoji: "🎩", label: "Hi-hat", color: "#4fb8e8" },
  { id: "cymbal", drum: "cymbal", emoji: "💿", label: "Cymbal", color: "#a888e8" },
  { id: "block", drum: "block", emoji: "🪵", label: "Wood block", color: "#c9945f" },
  { id: "shaker", drum: "shaker", emoji: "🫘", label: "Shaker", color: "#f08fb0" },
];

export default function Drums({ onHome }) {
  const [hits, setHits] = useState({}); // pad id → counter, to key the ripple
  const timers = useRef([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
  }, []);

  const hit = useCallback((pad) => {
    playDrum(pad.drum);
    vibrate(22);
    // A counter rather than a boolean: re-keying the ripple restarts it, so
    // fast repeated hits each get their own flash instead of one long one.
    setHits((prev) => ({ ...prev, [pad.id]: (prev[pad.id] || 0) + 1 }));
  }, []);

  return (
    <GameShell title="Drums" tone="create" onHome={onHome}>
      <div className="dr-grid">
        {PADS.map((pad, i) => (
          <motion.button
            key={pad.id}
            type="button"
            className="dr-pad tappable"
            style={{ "--pad-color": pad.color }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.9 }}
            onPointerDown={() => hit(pad)}
            onClick={(e) => e.preventDefault()}
            aria-label={pad.label}
          >
            <span className="dr-emoji">{pad.emoji}</span>
            {hits[pad.id] ? (
              <motion.span
                key={hits[pad.id]}
                className="dr-ripple"
                initial={{ scale: 0.3, opacity: 0.85 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ) : null}
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}
