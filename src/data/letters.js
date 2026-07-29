/**
 * A-Z, each with a word and a picture.
 *
 * Two rules picked the words:
 *
 * 1. **Concrete nouns a 3-year-old already knows.** "A is for Apple" teaches
 *    the letter; "A is for Aardvark" teaches nothing because the child has no
 *    peg to hang it on.
 * 2. **Only long-established emoji.** Anything from Unicode 14+ (2021) renders
 *    as an empty box on the older Android phones this targets, and a blank
 *    card is worse than a duller word.
 *
 * X is the perennial problem: no toddler-familiar word *starts* with it. "Box"
 * teaches the /ks/ sound honestly with a universally supported picture, which
 * beats an X-ray emoji that may not render at all.
 */

export const LETTERS = [
  { letter: "A", word: "Apple", emoji: "🍎", color: "#f4a6a0" },
  { letter: "B", word: "Ball", emoji: "⚽", color: "#a8dadc" },
  { letter: "C", word: "Cat", emoji: "🐱", color: "#ffd166" },
  { letter: "D", word: "Dog", emoji: "🐶", color: "#d4a373" },
  { letter: "E", word: "Elephant", emoji: "🐘", color: "#b8c0c8" },
  { letter: "F", word: "Fish", emoji: "🐟", color: "#90e0ef" },
  { letter: "G", word: "Grapes", emoji: "🍇", color: "#c8b6ff" },
  { letter: "H", word: "House", emoji: "🏠", color: "#f8ad9d" },
  { letter: "I", word: "Ice cream", emoji: "🍦", color: "#ffe5ec" },
  { letter: "J", word: "Jug", emoji: "🥛", color: "#e2eafc" },
  { letter: "K", word: "Key", emoji: "🔑", color: "#ffd670" },
  { letter: "L", word: "Lion", emoji: "🦁", color: "#f6bd60" },
  { letter: "M", word: "Moon", emoji: "🌙", color: "#bdb2ff" },
  { letter: "N", word: "Nose", emoji: "👃", color: "#ffc8dd" },
  { letter: "O", word: "Orange", emoji: "🍊", color: "#ffb703" },
  { letter: "P", word: "Panda", emoji: "🐼", color: "#e9ecef" },
  { letter: "Q", word: "Queen", emoji: "👑", color: "#ffd670" },
  { letter: "R", word: "Rainbow", emoji: "🌈", color: "#caf0f8" },
  { letter: "S", word: "Sun", emoji: "☀️", color: "#ffe066" },
  { letter: "T", word: "Tree", emoji: "🌳", color: "#a7d489" },
  { letter: "U", word: "Umbrella", emoji: "☂️", color: "#a2d2ff" },
  { letter: "V", word: "Van", emoji: "🚐", color: "#cdb4db" },
  { letter: "W", word: "Watermelon", emoji: "🍉", color: "#ff8fa3" },
  { letter: "X", word: "Box", emoji: "📦", color: "#e0c097" },
  { letter: "Y", word: "Yo-yo", emoji: "🪀", color: "#ffafcc" },
  { letter: "Z", word: "Zebra", emoji: "🦓", color: "#dee2e6" },
];

export default LETTERS;
