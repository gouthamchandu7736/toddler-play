import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GameShell from "../ui/GameShell.jsx";
import Button from "../ui/Button.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Tap-to-fill colouring.
 *
 * Deliberately NOT a freehand drawing pad. Freehand needs a finger dragged
 * across the screen, and this app cancels every `touchmove` so a toddler
 * cannot swipe her way out of the play area (pull-to-refresh, overscroll,
 * back-swipe). Tap-to-fill gives the same satisfaction — "I made that pink" —
 * with the gesture lockdown fully intact.
 *
 * It also removes the frustration of colouring in: a 3-year-old cannot stay
 * inside lines, and here she never has to.
 *
 * Pictures are inline SVG paths so they scale to any screen with no assets to
 * load and nothing to precache.
 */

const PALETTE = [
  { id: "red", name: "red", hex: "#ef5f5f" },
  { id: "orange", name: "orange", hex: "#ff9a4d" },
  { id: "yellow", name: "yellow", hex: "#ffd23f" },
  { id: "green", name: "green", hex: "#5ed48a" },
  { id: "blue", name: "blue", hex: "#4fb3f0" },
  { id: "purple", name: "purple", hex: "#a78bfa" },
  { id: "pink", name: "pink", hex: "#ff8fb1" },
  { id: "brown", name: "brown", hex: "#b07a52" },
];

/** Each picture is a set of independently fillable regions. */
const PICTURES = [
  {
    id: "flower",
    label: "Flower",
    parts: [
      { id: "p1", d: "M100 26a26 26 0 1 1 0 52 26 26 0 0 1 0-52Z" },
      { id: "p2", d: "M100 122a26 26 0 1 1 0 52 26 26 0 0 1 0-52Z" },
      { id: "p3", d: "M52 74a26 26 0 1 1 0 52 26 26 0 0 1 0-52Z" },
      { id: "p4", d: "M148 74a26 26 0 1 1 0 52 26 26 0 0 1 0-52Z" },
      { id: "mid", d: "M100 74a26 26 0 1 1 0 52 26 26 0 0 1 0-52Z" },
      { id: "stem", d: "M94 126h12v58H94z" },
      { id: "leaf", d: "M106 150c26-6 40 4 46 16-22 8-38 2-46-16Z" },
    ],
  },
  {
    id: "house",
    label: "House",
    parts: [
      { id: "roof", d: "M100 30 24 92h152L100 30Z" },
      { id: "wall", d: "M42 92h116v88H42z" },
      { id: "door", d: "M86 128h28v52H86z" },
      { id: "win1", d: "M56 108h24v24H56z" },
      { id: "win2", d: "M120 108h24v24h-24z" },
      { id: "sun", d: "M172 24a16 16 0 1 1 0 32 16 16 0 0 1 0-32Z" },
    ],
  },
  {
    id: "fish",
    label: "Fish",
    parts: [
      { id: "body", d: "M120 100c0 30-26 46-56 46s-46-20-46-46 16-46 46-46 56 16 56 46Z" },
      { id: "tail", d: "M120 100 176 62v76L120 100Z" },
      { id: "fin", d: "M62 54c8-18 20-26 30-24-2 12-10 20-30 24Z" },
      { id: "eye", d: "M44 88a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" },
      { id: "bub", d: "M158 34a11 11 0 1 1 0 22 11 11 0 0 1 0-22Z" },
    ],
  },
  {
    id: "boat",
    label: "Boat",
    parts: [
      { id: "hull", d: "M28 128h144l-24 46H52l-24-46Z" },
      { id: "sail1", d: "M96 24v96H40L96 24Z" },
      { id: "sail2", d: "M108 44v76h52l-52-76Z" },
      { id: "mast", d: "M96 24h8v104h-8z" },
      { id: "wave", d: "M14 184h172v14H14z" },
    ],
  },
];

const OUTLINE = "#4a3f63";

export default function Coloring({ onHome }) {
  const [pictureIndex, setPictureIndex] = useState(0);
  const [color, setColor] = useState(PALETTE[0]);
  const [fills, setFills] = useState({});

  const timers = useRef([]);
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
  }, []);

  const picture = PICTURES[pictureIndex];

  const paint = useCallback(
    (partId) => {
      playSfx("pop");
      vibrate(18);
      setFills((prev) => ({ ...prev, [`${picture.id}:${partId}`]: color.hex }));
    },
    [color, picture.id],
  );

  const pickColor = (c) => {
    setColor(c);
    speak(c.name);
  };

  const nextPicture = () => {
    setPictureIndex((i) => (i + 1) % PICTURES.length);
    speak(PICTURES[(pictureIndex + 1) % PICTURES.length].label);
  };

  const clear = () => {
    // Only this picture's fills — switching away and back should not lose the
    // other drawings.
    setFills((prev) => {
      const next = {};
      for (const k of Object.keys(prev)) {
        if (!k.startsWith(`${picture.id}:`)) next[k] = prev[k];
      }
      return next;
    });
    playSfx("woosh");
  };

  return (
    <GameShell
      title="Colouring"
      tone="create"
      onHome={onHome}
      right={
        <Button
          icon="next"
          shape="round"
          tone="ghost"
          size="md"
          label="Another picture"
          sfx="woosh"
          onPress={nextPicture}
        />
      }
    >
      <div className="col-stage">
        <motion.svg
          key={picture.id}
          className="col-canvas"
          viewBox="0 0 200 200"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="img"
          aria-label={`Colour in the ${picture.label}`}
        >
          {picture.parts.map((part) => (
            <path
              key={part.id}
              d={part.d}
              className="col-part"
              fill={fills[`${picture.id}:${part.id}`] || "#ffffff"}
              stroke={OUTLINE}
              strokeWidth="4"
              strokeLinejoin="round"
              onPointerDown={() => paint(part.id)}
              aria-label={`Region ${part.id}`}
            />
          ))}
        </motion.svg>
      </div>

      <div className="col-tools">
        <div className="col-palette" role="group" aria-label="Colours">
          {PALETTE.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              className={`col-swatch tappable${color.id === c.id ? " is-active" : ""}`}
              style={{ "--swatch": c.hex }}
              whileTap={{ scale: 0.88 }}
              animate={{ scale: color.id === c.id ? 1.14 : 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              onPointerDown={() => pickColor(c)}
              onClick={(e) => e.preventDefault()}
              aria-label={c.name}
              aria-pressed={color.id === c.id}
            />
          ))}
        </div>

        <Button
          icon="close"
          shape="round"
          tone="ghost"
          size="md"
          label="Start again"
          sfx="woosh"
          onPress={clear}
          className="col-clear"
        />
      </div>
    </GameShell>
  );
}
