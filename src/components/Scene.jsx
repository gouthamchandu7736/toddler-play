import Character from "./Character.jsx";
import HomeButton from "./HomeButton.jsx";

/**
 * Lays out a theme's characters.
 *
 * The grid is fixed at 2x3 (portrait) / 3x2 (landscape) rather than
 * auto-flowing: with `auto-fit` the tile count changes with the viewport and
 * the layout can overflow, and this app must never scroll. Six characters
 * always fit, at any phone size, in either orientation.
 */
export default function Scene({ characters, onHome, background }) {
  return (
    <div
      className="screen scene"
      style={background ? { background } : undefined}
    >
      <div className="scene-grid">
        {characters.map((c) => (
          <Character key={c.id} character={c} />
        ))}
      </div>
      <HomeButton onClick={onHome} />
    </div>
  );
}
