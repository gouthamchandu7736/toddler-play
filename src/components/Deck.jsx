import HomeButton from "./HomeButton.jsx";
import Brand from "./Brand.jsx";
import { playSfx, vibrate } from "../audio/audioManager.js";

/**
 * Shared chrome for the flashcard games (Letters, Numbers).
 *
 * The previous/next arrows run down the full left and right EDGES rather than
 * sitting in corners. Two reasons: the target becomes enormous (a whole side
 * of the screen), and it stays clear of the Home and replay buttons in the
 * bottom corners, which a toddler hits constantly by accident.
 *
 * Navigation wraps around in both directions. There is no first or last card
 * to get stuck on, and no disabled button — a disabled control is a dead tap.
 */
export default function Deck({
  onPrev,
  onNext,
  onReplay,
  onHome,
  className = "",
  children,
}) {
  const step = (fn) => {
    playSfx("woosh");
    vibrate(20);
    fn();
  };

  return (
    <div className={`screen game deck ${className}`}>
      <Brand />

      <button
        type="button"
        className="deck-arrow deck-prev tappable"
        onPointerDown={() => step(onPrev)}
        onClick={(e) => e.preventDefault()}
        aria-label="Previous"
      >
        <span>‹</span>
      </button>

      <div className="deck-stage">{children}</div>

      <button
        type="button"
        className="deck-arrow deck-next tappable"
        onPointerDown={() => step(onNext)}
        onClick={(e) => e.preventDefault()}
        aria-label="Next"
      >
        <span>›</span>
      </button>

      <button
        type="button"
        className="deck-replay tappable"
        onPointerDown={onReplay}
        onClick={(e) => e.preventDefault()}
        aria-label="Say it again"
      >
        🔊
      </button>

      <HomeButton onClick={onHome} />
    </div>
  );
}
