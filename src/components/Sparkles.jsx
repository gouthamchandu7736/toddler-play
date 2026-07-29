import { motion } from "framer-motion";

/**
 * A one-shot burst of particles flung outward from the centre of its parent.
 *
 * Render it with a `key` that changes on every tap — remounting is what
 * replays the burst, which is cheaper and more reliable than resetting an
 * animation controller.
 *
 * Purely decorative, so it is pointer-events: none. A toddler taps fast and
 * repeatedly; particles must never swallow the next tap.
 */

const PARTICLES = ["✨", "⭐", "💫", "🌟"];

export default function Sparkles({ count = 8, distance = 90, emoji = null }) {
  return (
    <div className="sparkles" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const spread = distance * (0.7 + Math.random() * 0.6);
        return (
          <motion.span
            key={i}
            className="sparkle"
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * spread,
              y: Math.sin(angle) * spread,
              scale: [0.4, 1.1, 0.2],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            {emoji || PARTICLES[i % PARTICLES.length]}
          </motion.span>
        );
      })}
    </div>
  );
}
