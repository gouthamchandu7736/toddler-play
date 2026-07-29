import { playSfx } from "../audio/audioManager.js";

/**
 * The one navigation control a child is allowed to use.
 *
 * Deliberately NOT behind the parent gate: going home stays inside the play
 * area, so a toddler pressing it has done nothing wrong. Only leaving the app
 * (settings/exit) is gated — see ParentGate.jsx.
 *
 * Sits in a corner rather than the middle so it isn't hit during play, but is
 * still a full-size target.
 */
export default function HomeButton({ onClick }) {
  return (
    <button
      type="button"
      className="home-button tappable"
      onPointerDown={() => {
        playSfx("woosh");
        onClick();
      }}
      onClick={(e) => e.preventDefault()}
      aria-label="Home"
    >
      🏠
    </button>
  );
}
