/**
 * Tap-to-discover scenes.
 *
 * Everything visual and audible about a character lives here as data, so
 * swapping emoji for custom SVG art later is a change to this file, not to
 * Character.jsx or Scene.jsx. A new theme is a new array and one Home tile —
 * no new components, no new screen state.
 *
 * Fields:
 *   id        stable key
 *   label     spoken and shown name ("Cow")
 *   emoji     the art for now
 *   soundText the noise or fact spoken after the name ("Moo")
 *   color     backdrop tint for its tile
 *
 * Emoji are chosen from the long-established set on purpose. Newer additions
 * (Unicode 14+) render as an empty box on the older phones this targets, and a
 * blank tile is worse than a less exotic animal.
 */

export const FARM = [
  { id: "cow", label: "Cow", emoji: "🐄", soundText: "Moo", color: "#f4a6a0" },
  { id: "pig", label: "Pig", emoji: "🐖", soundText: "Oink", color: "#f7b6d2" },
  { id: "sheep", label: "Sheep", emoji: "🐑", soundText: "Baa", color: "#cfd8dc" },
  { id: "chicken", label: "Chicken", emoji: "🐔", soundText: "Cluck", color: "#ffd166" },
  { id: "horse", label: "Horse", emoji: "🐴", soundText: "Neigh", color: "#d4a373" },
  { id: "duck", label: "Duck", emoji: "🦆", soundText: "Quack", color: "#a8dadc" },
];

export const ANIMALS = [
  { id: "lion", label: "Lion", emoji: "🦁", soundText: "Roar", color: "#f6bd60" },
  { id: "elephant", label: "Elephant", emoji: "🐘", soundText: "Trumpet", color: "#b8c0c8" },
  { id: "monkey", label: "Monkey", emoji: "🐒", soundText: "Ooh ooh", color: "#d4a373" },
  { id: "tiger", label: "Tiger", emoji: "🐯", soundText: "Growl", color: "#f4a261" },
  { id: "bear", label: "Bear", emoji: "🐻", soundText: "Grrr", color: "#c8a27a" },
  { id: "frog", label: "Frog", emoji: "🐸", soundText: "Ribbit", color: "#a7d489" },
  { id: "snake", label: "Snake", emoji: "🐍", soundText: "Hiss", color: "#94d2a5" },
  { id: "rabbit", label: "Rabbit", emoji: "🐰", soundText: "Hop hop", color: "#f2d7d9" },
];

export const BIRDS = [
  { id: "parrot", label: "Parrot", emoji: "🦜", soundText: "Squawk", color: "#7cd6a0" },
  { id: "owl", label: "Owl", emoji: "🦉", soundText: "Hoo hoo", color: "#c9ada7" },
  { id: "penguin", label: "Penguin", emoji: "🐧", soundText: "Waddle waddle", color: "#a8dadc" },
  { id: "eagle", label: "Eagle", emoji: "🦅", soundText: "Screech", color: "#d5bdaf" },
  { id: "swan", label: "Swan", emoji: "🦢", soundText: "Honk", color: "#e8e8e4" },
  { id: "chick", label: "Chick", emoji: "🐤", soundText: "Cheep cheep", color: "#ffe08a" },
  { id: "peacock", label: "Peacock", emoji: "🦚", soundText: "Look at my feathers", color: "#8ecae6" },
  { id: "flamingo", label: "Flamingo", emoji: "🦩", soundText: "I stand on one leg", color: "#ffb3c6" },
];

export const VEHICLES = [
  { id: "car", label: "Car", emoji: "🚗", soundText: "Beep beep", color: "#f28482" },
  { id: "bus", label: "Bus", emoji: "🚌", soundText: "All aboard", color: "#ffd166" },
  { id: "train", label: "Train", emoji: "🚂", soundText: "Choo choo", color: "#a5a58d" },
  { id: "plane", label: "Aeroplane", emoji: "✈️", soundText: "Whoosh", color: "#a8dadc" },
  { id: "helicopter", label: "Helicopter", emoji: "🚁", soundText: "Chop chop chop", color: "#bdb2ff" },
  { id: "boat", label: "Boat", emoji: "⛵", soundText: "Splash", color: "#90e0ef" },
  { id: "tractor", label: "Tractor", emoji: "🚜", soundText: "Rumble", color: "#a7d489" },
  { id: "fireEngine", label: "Fire engine", emoji: "🚒", soundText: "Nee naw nee naw", color: "#f4978e" },
];

/**
 * Shapes. Every emoji here is from Unicode 6.0 (2010), so these render on
 * literally any phone — newer geometric emoji like 🟦 and 🟩 arrived in 2019
 * and show as empty boxes on older Android.
 */
export const SHAPES = [
  { id: "circle", label: "Circle", emoji: "🔴", soundText: "Round and round", color: "#ffd6d6" },
  { id: "square", label: "Square", emoji: "⬛", soundText: "Four equal sides", color: "#dfe3e6" },
  { id: "triangle", label: "Triangle", emoji: "🔺", soundText: "Three sides", color: "#ffe0d0" },
  { id: "star", label: "Star", emoji: "⭐", soundText: "Twinkle twinkle", color: "#fff0c2" },
  { id: "heart", label: "Heart", emoji: "❤️", soundText: "I love you", color: "#ffd9e2" },
  { id: "diamond", label: "Diamond", emoji: "🔷", soundText: "Shiny", color: "#d6e9ff" },
];

export const FRUITS = [
  { id: "apple", label: "Apple", emoji: "🍎", soundText: "Crunchy", color: "#ffd6d6" },
  { id: "banana", label: "Banana", emoji: "🍌", soundText: "Peel it", color: "#fff3c4" },
  { id: "grapes", label: "Grapes", emoji: "🍇", soundText: "Tiny and sweet", color: "#e6d9ff" },
  { id: "strawberry", label: "Strawberry", emoji: "🍓", soundText: "Sweet", color: "#ffdde3" },
  { id: "orange", label: "Orange", emoji: "🍊", soundText: "Juicy", color: "#ffe3c2" },
  { id: "watermelon", label: "Watermelon", emoji: "🍉", soundText: "Big and juicy", color: "#d8f5d0" },
  { id: "cherry", label: "Cherries", emoji: "🍒", soundText: "Two on a stalk", color: "#ffd0d6" },
  { id: "pineapple", label: "Pineapple", emoji: "🍍", soundText: "Spiky on top", color: "#fff0bf" },
];

export const VEGETABLES = [
  { id: "carrot", label: "Carrot", emoji: "🥕", soundText: "Crunchy and orange", color: "#ffd9b3" },
  { id: "corn", label: "Corn", emoji: "🌽", soundText: "Yellow and sweet", color: "#fff0bf" },
  { id: "tomato", label: "Tomato", emoji: "🍅", soundText: "Round and red", color: "#ffd0cc" },
  { id: "aubergine", label: "Aubergine", emoji: "🍆", soundText: "Big and purple", color: "#e0d4f5" },
  { id: "broccoli", label: "Broccoli", emoji: "🥦", soundText: "Like a little tree", color: "#d3f0d0" },
  { id: "potato", label: "Potato", emoji: "🥔", soundText: "Grows underground", color: "#ecdcc4" },
  { id: "pepper", label: "Pepper", emoji: "🌶️", soundText: "Spicy", color: "#ffcfcf" },
  { id: "mushroom", label: "Mushroom", emoji: "🍄", soundText: "Has a little hat", color: "#f5dede" },
];

/** Backdrops, keyed to match the scene ids used by Home and App. */
export const SCENE_BACKGROUNDS = {
  farm: "linear-gradient(#bde3ff 0%, #bde3ff 45%, #a7d489 45%, #7cc576 100%)",
  animals: "linear-gradient(#cfe8b0 0%, #b7dd90 45%, #8fbf6a 100%)",
  birds: "linear-gradient(#bde3ff 0%, #d9f0ff 60%, #eaf7d9 100%)",
  vehicles: "linear-gradient(#dbe7f3 0%, #c9d6e3 55%, #9aa7b4 55%, #7d8a97 100%)",
  shapes: "linear-gradient(160deg, #fdf6e3 0%, #ffe8f0 60%, #e8e0ff 100%)",
  fruits: "linear-gradient(160deg, #fff4e0 0%, #ffe6cc 55%, #ffd9d9 100%)",
  vegetables: "linear-gradient(160deg, #eefbe6 0%, #dff3d0 55%, #cbe8c0 100%)",
};

export const SCENES = {
  farm: { characters: FARM, background: SCENE_BACKGROUNDS.farm },
  animals: { characters: ANIMALS, background: SCENE_BACKGROUNDS.animals },
  birds: { characters: BIRDS, background: SCENE_BACKGROUNDS.birds },
  vehicles: { characters: VEHICLES, background: SCENE_BACKGROUNDS.vehicles },
  shapes: { characters: SHAPES, background: SCENE_BACKGROUNDS.shapes },
  fruits: { characters: FRUITS, background: SCENE_BACKGROUNDS.fruits },
  vegetables: { characters: VEGETABLES, background: SCENE_BACKGROUNDS.vegetables },
};

export default SCENES;
