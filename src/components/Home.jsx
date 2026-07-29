import { motion } from "framer-motion";
import Brand from "./Brand.jsx";
import { playSfx, speak, vibrate } from "../audio/audioManager.js";

/**
 * Picture-only navigation.
 *
 * Each tile is a big emoji plus a spoken name — nothing here requires reading
 * (PLAN.md Section 2 rule 4). The word under each picture is for the grown-up;
 * the child navigates by image and by what the tile says when touched.
 *
 * Ordered learn-then-play rather than alphabetically or by date added: the
 * quieter activities sit at the top where they get picked first, and the
 * high-energy ones are further down. Everything stays on one screen — this app
 * never scrolls, so the grid grows in rows, never in pages.
 *
 * The gear is the only route out of the play area, so it is deliberately
 * small, corner-placed, and gated.
 */

const TILES = [
  { id: "letters", kind: "game", emoji: "🔤", label: "Letters", color: "#f6bd60" },
  { id: "numbers", kind: "game", emoji: "🔢", label: "Numbers", color: "#a2d2ff" },
  { id: "farm", kind: "scene", emoji: "🐄", label: "Farm", color: "#a7d489" },
  { id: "animals", kind: "scene", emoji: "🦁", label: "Animals", color: "#f4a261" },
  { id: "birds", kind: "scene", emoji: "🦜", label: "Birds", color: "#90e0ef" },
  { id: "vehicles", kind: "scene", emoji: "🚗", label: "Vehicles", color: "#f28482" },
  { id: "fruits", kind: "scene", emoji: "🍓", label: "Fruits", color: "#ffb3c1" },
  { id: "shapes", kind: "scene", emoji: "🔷", label: "Shapes", color: "#b8c0ff" },
  { id: "findIt", kind: "game", emoji: "🔍", label: "Find it", color: "#cdb4db" },
  { id: "findColor", kind: "game", emoji: "🎨", label: "Colors", color: "#f7b6d2" },
  { id: "shapePop", kind: "game", emoji: "🫧", label: "Pop", color: "#a8dadc" },
  { id: "copyTune", kind: "game", emoji: "🎵", label: "Music", color: "#ffd166" },
];

export default function Home({ onPick, onSettings }) {
  const pick = (tile) => {
    playSfx("woosh");
    vibrate(30);
    speak(tile.label);
    onPick(tile);
  };

  return (
    <div className="screen home">
      {/* Sits in the strip the grid already reserves for the gear, so it
          costs no play area. */}
      <Brand variant="bar" />

      <div className="home-grid">
        {TILES.map((tile, i) => (
          <motion.button
            key={tile.id}
            type="button"
            className="home-tile tappable"
            style={{ "--tile-color": tile.color }}
            whileTap={{ scale: 0.92 }}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              // Stagger the idle float so the grid breathes instead of pulsing.
              delay: (i % 5) * 0.28,
            }}
            onPointerDown={() => pick(tile)}
            onClick={(e) => e.preventDefault()}
            aria-label={tile.label}
          >
            <span className="home-tile-emoji">{tile.emoji}</span>
            <span className="home-tile-label">{tile.label}</span>
          </motion.button>
        ))}
      </div>

      <button
        type="button"
        className="settings-button tappable"
        onPointerDown={onSettings}
        onClick={(e) => e.preventDefault()}
        aria-label="Grown-up settings"
      >
        ⚙️
      </button>
    </div>
  );
}
