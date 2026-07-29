import Character from "./Character.jsx";
import GameShell from "../ui/GameShell.jsx";

/**
 * Lays out a theme's characters.
 *
 * Columns are fixed with `grid-auto-rows: 1fr`, not `auto-fit`: rows are added
 * as a scene needs them and share the height equally, so a 6- or 8-character
 * scene always fits without scrolling. `auto-fit` would change the tile count
 * with the viewport and can overflow, and this app never scrolls.
 */
export default function Scene({ title, characters, onHome, onSettings }) {
  return (
    <GameShell title={title} tone="discover" onHome={onHome} onSettings={onSettings}>
      <div className="scene-grid">
        {characters.map((c) => (
          <Character key={c.id} character={c} />
        ))}
      </div>
    </GameShell>
  );
}
