import { motion } from "framer-motion";
import Icon from "./Icon.jsx";
import { playSfx, vibrate } from "../audio/audioManager.js";

/**
 * The one button in the app.
 *
 * Every interactive control routes through this so size, radius, shadow,
 * press feel and sound are identical everywhere — which is most of what
 * "consistent design system" actually means in practice.
 *
 * Two decisions carried over from the toddler rules:
 *
 * - **Fires on pointer-down, not click.** A click waits for the finger to
 *   lift; on a slow phone that is 100-300 ms of nothing after she has already
 *   touched the screen, which reads as a dead tap.
 * - **No hover styling that matters.** This runs on a tablet. Hover exists for
 *   the grown-up on a desktop, but every state that carries meaning is
 *   expressed in the *pressed* state instead, because a finger has no hover.
 *
 * @param tone     colour key: sky | sun | coral | grape | mint | bubblegum | ghost
 * @param size     sm | md | lg
 * @param shape    pill | round (round = 1:1 icon button)
 */
export default function Button({
  tone = "sky",
  size = "md",
  shape = "pill",
  icon = null,
  iconFilled = false,
  label,
  children,
  onPress,
  sfx = "pop",
  className = "",
  ...rest
}) {
  const handle = (e) => {
    e.preventDefault();
    if (sfx) playSfx(sfx);
    vibrate(20);
    if (onPress) onPress(e);
  };

  return (
    <motion.button
      type="button"
      className={`btn btn-${tone} btn-${size} btn-${shape} ${className}`}
      // Squash on press: the whole button dips into its own solid shadow, so
      // it reads as physically pushed rather than merely highlighted.
      whileTap={{ scale: 0.94, y: 3 }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
      onPointerDown={handle}
      onClick={(e) => e.preventDefault()}
      aria-label={label}
      {...rest}
    >
      {icon && <Icon name={icon} filled={iconFilled} className="btn-icon" />}
      {children && <span className="btn-text">{children}</span>}
    </motion.button>
  );
}
