import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GameShell from "../ui/GameShell.jsx";
import Button from "../ui/Button.jsx";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * A sticker book: pick a sticker, tap the scene to place it.
 *
 * Tap-to-place rather than drag-and-drop, for the same reason as Colouring —
 * `touchmove` is cancelled app-wide so a toddler cannot swipe out of the play
 * area. It is also simply easier: drag-and-drop demands sustained pressure and
 * accurate release, which is exactly the motor skill a three-year-old lacks.
 *
 * There is no right place for anything. This is the one activity in the app
 * with no correct answer at all.
 */

const SCENES = [
  { id: "meadow", label: "Meadow", sky: "#bfe6ff", ground: "#9fdc9f", emoji: "🌳" },
  { id: "sea", label: "Under the sea", sky: "#7ecbe8", ground: "#f2e2b6", emoji: "🐚" },
  { id: "space", label: "Space", sky: "#3a3466", ground: "#8b7fb5", emoji: "🌕" },
];

const STICKERS = [
  "🦋", "🌻", "🐞", "🐝", "🌈", "⭐", "🍄", "🐰",
  "🐠", "🐢", "⛵", "🚀", "☁️", "🎈", "🦆", "🌺",
];

const MAX_STICKERS = 40; // a cap so a very determined child can't lag the page

export default function Stickers({ onHome }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [placed, setPlaced] = useState({}); // sceneId → [{id,x,y,emoji}]

  const stageRef = useRef(null);
  const nextId = useRef(0);

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const scene = SCENES[sceneIndex];
  const items = placed[scene.id] || [];

  const place = useCallback(
    (e) => {
      const box = stageRef.current?.getBoundingClientRect();
      if (!box) return;

      // Percentages, not pixels: placements then survive rotation and resize.
      const x = ((e.clientX - box.left) / box.width) * 100;
      const y = ((e.clientY - box.top) / box.height) * 100;
      if (x < 0 || x > 100 || y < 0 || y > 100) return;

      playSfx("pop");
      vibrate(18);

      setPlaced((prev) => {
        const current = prev[scene.id] || [];
        const next = [...current, { id: nextId.current++, x, y, emoji: sticker }];
        return { ...prev, [scene.id]: next.slice(-MAX_STICKERS) };
      });
    },
    [scene.id, sticker],
  );

  const clear = () => {
    playSfx("woosh");
    setPlaced((prev) => ({ ...prev, [scene.id]: [] }));
  };

  const nextScene = () => {
    const next = (sceneIndex + 1) % SCENES.length;
    setSceneIndex(next);
    speak(SCENES[next].label);
  };

  return (
    <GameShell
      title="Stickers"
      tone="create"
      onHome={onHome}
      right={
        <Button
          icon="next"
          shape="round"
          tone="ghost"
          size="md"
          label="Another scene"
          sfx="woosh"
          onPress={nextScene}
        />
      }
    >
      <div
        ref={stageRef}
        className="st-stage"
        style={{ "--sky": scene.sky, "--ground": scene.ground }}
        onPointerDown={place}
        role="application"
        aria-label={`${scene.label}. Tap to place a sticker.`}
      >
        <span className="st-scene-mark" aria-hidden="true">{scene.emoji}</span>

        {items.map((it) => (
          <motion.span
            key={it.id}
            className="st-placed"
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            initial={{ scale: 0, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 16 }}
          >
            {it.emoji}
          </motion.span>
        ))}
      </div>

      <div className="st-tray">
        <div className="st-picker" role="group" aria-label="Stickers">
          {STICKERS.map((s) => (
            <motion.button
              key={s}
              type="button"
              className={`st-choice tappable${sticker === s ? " is-active" : ""}`}
              whileTap={{ scale: 0.86 }}
              animate={{ scale: sticker === s ? 1.16 : 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSticker(s);
                playSfx("pop");
              }}
              onClick={(e) => e.preventDefault()}
              aria-label={`Sticker ${s}`}
              aria-pressed={sticker === s}
            >
              {s}
            </motion.button>
          ))}
        </div>

        <Button
          icon="close"
          shape="round"
          tone="ghost"
          size="md"
          label="Clear the scene"
          sfx="woosh"
          onPress={clear}
        />
      </div>
    </GameShell>
  );
}
