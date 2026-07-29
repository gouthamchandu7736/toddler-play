import { motion } from "framer-motion";
import Icon from "./Icon.jsx";
import { playSfx, speak, vibrate } from "../audio/audioManager.js";

/**
 * A game card: thumbnail, title, blurb, play affordance, favourite toggle.
 *
 * Two deliberate departures from how a card like this normally works on the
 * web, both because the user is three years old:
 *
 * 1. **The whole card is the play button.** There is a Play pill in the
 *    corner, but it is `pointer-events: none` — it exists to say "this is
 *    playable", not to be aimed at. A small button inside a big card teaches a
 *    child that only part of a thing is tappable, and every miss is then a
 *    dead tap. One card, one target, ~170px.
 *
 * 2. **The blurb is for the grown-up.** She cannot read it. It never carries
 *    information she needs — the emoji identifies the game and the title is
 *    spoken aloud when she touches the card.
 *
 * The favourite star IS a second target, which is a real cost. It earns it by
 * being harmless: a mis-tap toggles a star and does not navigate, take
 * anything away, or interrupt play. It gets a full 88px hit area even though
 * it looks smaller.
 */
export default function GameCard({
  activity,
  onOpen,
  isFavourite = false,
  onToggleFavourite,
  index = 0,
}) {
  const open = () => {
    playSfx("woosh");
    vibrate(25);
    speak(activity.label);
    onOpen(activity);
  };

  const favourite = (e) => {
    e.stopPropagation();
    playSfx(isFavourite ? "soft" : "chime");
    vibrate(15);
    onToggleFavourite(activity.id);
  };

  return (
    <motion.div
      className={`card card-${activity.tone}`}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.34,
        // Cards flow in one after another so the screen assembles itself
        // instead of snapping into place.
        delay: Math.min(index * 0.045, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.button
        type="button"
        className="card-hit tappable"
        whileTap={{ scale: 0.96, y: 2 }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
        onPointerDown={open}
        onClick={(e) => e.preventDefault()}
        aria-label={`${activity.label}. ${activity.blurb}`}
      >
        <span className="card-thumb">
          <span className="card-emoji">{activity.emoji}</span>
        </span>

        <span className="card-body">
          <span className="card-title">{activity.label}</span>
          <span className="card-blurb">{activity.blurb}</span>
        </span>

        {/* Visual only — see note 1 above. */}
        <span className="card-play" aria-hidden="true">
          <Icon name="play" size={18} strokeWidth={2.6} />
        </span>
      </motion.button>

      <motion.button
        type="button"
        className={`card-fav tappable${isFavourite ? " is-on" : ""}`}
        whileTap={{ scale: 0.85 }}
        animate={isFavourite ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onPointerDown={favourite}
        onClick={(e) => e.preventDefault()}
        aria-label={
          isFavourite
            ? `Remove ${activity.label} from favourites`
            : `Add ${activity.label} to favourites`
        }
        aria-pressed={isFavourite}
      >
        <Icon name="star" filled={isFavourite} size={22} />
      </motion.button>
    </motion.div>
  );
}
