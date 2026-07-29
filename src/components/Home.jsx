import { motion } from "framer-motion";
import Brand from "./Brand.jsx";
import { playSfx, speak, vibrate } from "../audio/audioManager.js";

/**
 * Picture-only navigation.
 *
 * Each tile is an emoji the size of a fist plus a spoken name — nothing here
 * requires reading (PLAN.md Section 2 rule 4). The word under each picture is
 * for the grown-up; the child navigates by image and by what the tile says
 * when touched.
 *
 * The gear is the only route out of the play area, so it is deliberately
 * small, corner-placed, and gated.
 */

const TILES = [
  { id: "farm", kind: "scene", emoji: "🐄", label: "Farm", color: "#a7d489" },
  { id: "findColor", kind: "game", emoji: "🎨", label: "Colors", color: "#f4a6a0" },
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
        {TILES.map((tile) => (
          <motion.button
            key={tile.id}
            type="button"
            className="home-tile tappable"
            style={{ "--tile-color": tile.color }}
            whileTap={{ scale: 0.92 }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              // Stagger the idle float so the grid breathes instead of pulsing.
              delay: TILES.indexOf(tile) * 0.35,
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
