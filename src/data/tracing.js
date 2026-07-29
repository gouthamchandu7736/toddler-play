/**
 * Letter shapes for tracing, as ordered strokes.
 *
 * Each letter is a list of STROKES, and each stroke a list of points in a
 * 0-200 box, written in the direction a right-handed child is taught to form
 * the letter (top-to-bottom, left-to-right). Dots are generated evenly along
 * each stroke at runtime, so the data stays tiny and the dot spacing can be
 * tuned in one place.
 *
 * Only letters made of straight segments are included. Curves would need
 * bezier data and far more of it, and the point of the exercise is stroke
 * ORDER and DIRECTION — which straight letters teach perfectly well.
 */

export const TRACING = [
  { letter: "A", word: "Apple", emoji: "🍎",
    strokes: [[[52, 176], [100, 30]], [[100, 30], [148, 176]], [[70, 120], [130, 120]]] },
  { letter: "E", word: "Egg", emoji: "🥚",
    strokes: [[[60, 30], [60, 176]], [[60, 30], [146, 30]], [[60, 103], [130, 103]], [[60, 176], [146, 176]]] },
  { letter: "F", word: "Fish", emoji: "🐟",
    strokes: [[[62, 30], [62, 176]], [[62, 30], [146, 30]], [[62, 103], [128, 103]]] },
  { letter: "H", word: "Hat", emoji: "👒",
    strokes: [[[58, 30], [58, 176]], [[142, 30], [142, 176]], [[58, 103], [142, 103]]] },
  { letter: "I", word: "Ice cream", emoji: "🍦",
    strokes: [[[100, 30], [100, 176]], [[64, 30], [136, 30]], [[64, 176], [136, 176]]] },
  { letter: "K", word: "Kite", emoji: "🪁",
    strokes: [[[60, 30], [60, 176]], [[140, 30], [60, 106]], [[60, 106], [144, 176]]] },
  { letter: "L", word: "Lion", emoji: "🦁",
    strokes: [[[64, 30], [64, 176]], [[64, 176], [144, 176]]] },
  { letter: "T", word: "Tree", emoji: "🌳",
    strokes: [[[56, 32], [144, 32]], [[100, 32], [100, 176]]] },
  { letter: "V", word: "Van", emoji: "🚐",
    strokes: [[[56, 30], [100, 176]], [[100, 176], [144, 30]]] },
  { letter: "X", word: "Box", emoji: "📦",
    strokes: [[[58, 30], [142, 176]], [[142, 30], [58, 176]]] },
  { letter: "Y", word: "Yo-yo", emoji: "🪀",
    strokes: [[[58, 30], [100, 104]], [[142, 30], [100, 104]], [[100, 104], [100, 176]]] },
  { letter: "Z", word: "Zebra", emoji: "🦓",
    strokes: [[[58, 32], [142, 32]], [[142, 32], [58, 174]], [[58, 174], [142, 174]]] },
];

/**
 * Walk a stroke and drop a dot every `spacing` units, always keeping the first
 * and last point so corners stay sharp.
 */
export function dotsForStroke(points, spacing = 42) {
  const out = [{ x: points[0][0], y: points[0][1] }];

  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.round(dist / spacing));
    for (let s = 1; s <= steps; s += 1) {
      out.push({ x: x0 + ((x1 - x0) * s) / steps, y: y0 + ((y1 - y0) * s) / steps });
    }
  }
  return out;
}

export default TRACING;
