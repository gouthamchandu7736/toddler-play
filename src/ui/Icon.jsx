/**
 * The app's icon set.
 *
 * Hand-drawn inline SVG rather than an icon package, for three reasons:
 * nothing to download at runtime (the app must work offline with zero network
 * calls), no dependency to keep current, and total control of the stroke
 * weight so every icon in the UI matches.
 *
 * All icons share one 24x24 viewBox, one 2.4 stroke width, and round caps and
 * joins — that consistency is what makes a set look designed rather than
 * collected. They inherit `currentColor`, so colour is set by the parent.
 *
 * Note the split: these are for UI CHROME (back, home, star, settings). Game
 * identity stays emoji, because a 3-year-old recognises a full-colour 🐄
 * instantly and a two-tone line drawing of a cow not at all.
 */

const PATHS = {
  home: "M4 11.5 12 4l8 7.5M6.5 10v9h11v-9",
  back: "M14.5 5.5 8 12l6.5 6.5",
  next: "M9.5 5.5 16 12l-6.5 6.5",
  close: "M6.5 6.5l11 11M17.5 6.5l-11 11",
  settings:
    "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z M19.4 12a7.4 7.4 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7.4 7.4 0 0 0-2-1.2L14.6 3h-4l-.4 2.6a7.4 7.4 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7.4 7.4 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.06-.4.1-.8.1-1.2Z",
  volumeOn: "M5 9.5h3.5L13 6v12L8.5 14.5H5v-5Z M16.2 9a4.2 4.2 0 0 1 0 6M18.8 6.6a7.6 7.6 0 0 1 0 10.8",
  volumeOff: "M5 9.5h3.5L13 6v12L8.5 14.5H5v-5Z M16.5 9.5l5 5M21.5 9.5l-5 5",
  speaker: "M5 9.5h3.5L13 6v12L8.5 14.5H5v-5Z M16.2 9a4.2 4.2 0 0 1 0 6",
  play: "M8 5.5v13l11-6.5-11-6.5Z",
  lock: "M7 11V8.5a5 5 0 0 1 10 0V11M5.5 11h13v9h-13z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16 16l4 4",
  sparkle: "M12 3.5l2.2 5.3 5.3 2.2-5.3 2.2L12 18.5l-2.2-5.3L4.5 11l5.3-2.2L12 3.5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5.2l3.4 2",
};

/** Star is filled or outlined depending on state, so it gets its own shape. */
const STAR =
  "M12 3.6l2.6 5.6 6 .8-4.4 4.2 1.1 6.1-5.3-3-5.3 3 1.1-6.1L3.4 10l6-.8L12 3.6Z";

export default function Icon({
  name,
  size = 24,
  filled = false,
  strokeWidth = 2.4,
  className = "",
  ...rest
}) {
  const isStar = name === "star";
  const d = isStar ? STAR : PATHS[name];
  if (!d) return null;

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isStar && filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
