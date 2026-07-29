/**
 * The catalogue: every activity in the app, and the categories that group them.
 *
 * This is the single source of truth for navigation. Home reads CATEGORIES,
 * the category screen reads ACTIVITIES, and App.jsx maps `id` to a component.
 * Adding an activity is one entry here plus one line in App's registry.
 *
 * `blurb` is written for the GROWN-UP choosing an activity — it says what the
 * child will practise. She navigates by picture and by the name spoken aloud
 * when she touches the card, and never needs to read anything.
 */

export const CATEGORIES = [
  {
    id: "learn",
    label: "Learn",
    emoji: "🎓",
    blurb: "Letters, numbers, shapes and colours",
    tone: "learn",
  },
  {
    id: "discover",
    label: "Discover",
    emoji: "🌍",
    blurb: "Animals, birds, vehicles and food",
    tone: "discover",
  },
  {
    id: "think",
    label: "Think",
    emoji: "🧠",
    blurb: "Memory, matching and spotting",
    tone: "think",
  },
  {
    id: "play",
    label: "Play",
    emoji: "🎈",
    blurb: "Popping, catching and peekaboo",
    tone: "play",
  },
  {
    id: "create",
    label: "Create",
    emoji: "🎨",
    blurb: "Colouring and sticker scenes",
    tone: "create",
  },
  {
    id: "music",
    label: "Music",
    emoji: "🎵",
    blurb: "Piano, drums, tunes and rhymes",
    tone: "stories",
  },
];

/**
 * kind: "game"  → App renders the component registered under this id
 *       "scene" → App renders the shared tap-to-discover Scene with this data
 */
export const ACTIVITIES = [
  // --- Learn ---------------------------------------------------------------
  {
    id: "letters",
    kind: "game",
    category: "learn",
    label: "Letters",
    emoji: "🔤",
    blurb: "A to Z, with a word and a picture for each",
    tone: "sun",
  },
  {
    id: "numbers",
    kind: "game",
    category: "learn",
    label: "Numbers",
    emoji: "🔢",
    blurb: "Count 1 to 10, one object at a time",
    tone: "sky",
  },
  {
    id: "shapes",
    kind: "scene",
    category: "learn",
    label: "Shapes",
    emoji: "🔷",
    blurb: "Circle, square, triangle, star",
    tone: "grape",
  },
  {
    id: "findColor",
    kind: "game",
    category: "learn",
    label: "Colours",
    emoji: "🌈",
    blurb: "Find the colour that is called out",
    tone: "coral",
  },
  {
    id: "tracing",
    kind: "game",
    category: "learn",
    label: "Tracing",
    emoji: "✏️",
    blurb: "Follow the dots to form each letter",
    tone: "mint",
  },
  {
    id: "opposites",
    kind: "game",
    category: "learn",
    label: "Opposites",
    emoji: "↔️",
    blurb: "Big and small, hot and cold",
    tone: "lavender",
  },

  // --- Discover ------------------------------------------------------------
  {
    id: "farm",
    kind: "scene",
    category: "discover",
    label: "Farm",
    emoji: "🐄",
    blurb: "Six farm animals and the sounds they make",
    tone: "mint",
  },
  {
    id: "animals",
    kind: "scene",
    category: "discover",
    label: "Animals",
    emoji: "🦁",
    blurb: "Wild animals from around the world",
    tone: "sun",
  },
  {
    id: "birds",
    kind: "scene",
    category: "discover",
    label: "Birds",
    emoji: "🦜",
    blurb: "Birds and their calls",
    tone: "sky",
  },
  {
    id: "vehicles",
    kind: "scene",
    category: "discover",
    label: "Vehicles",
    emoji: "🚗",
    blurb: "Things that go, and the noises they make",
    tone: "coral",
  },
  {
    id: "fruits",
    kind: "scene",
    category: "discover",
    label: "Fruits",
    emoji: "🍓",
    blurb: "Name the fruits",
    tone: "bubblegum",
  },
  {
    id: "vegetables",
    kind: "scene",
    category: "discover",
    label: "Veggies",
    emoji: "🥕",
    blurb: "Name the vegetables",
    tone: "mint",
  },

  // --- Think ---------------------------------------------------------------
  {
    id: "findIt",
    kind: "game",
    category: "think",
    label: "Find it",
    emoji: "🔍",
    blurb: "Listen, then point to the right picture",
    tone: "grape",
  },
  {
    id: "memoryMatch",
    kind: "game",
    category: "think",
    label: "Match",
    emoji: "🃏",
    blurb: "Turn over cards and find the pairs",
    tone: "sky",
  },
  {
    id: "shadowMatch",
    kind: "game",
    category: "think",
    label: "Shadows",
    emoji: "🌗",
    blurb: "Match each picture to its shadow",
    tone: "lavender",
  },
  {
    id: "patterns",
    kind: "game",
    category: "think",
    label: "Patterns",
    emoji: "🔁",
    blurb: "Work out what comes next",
    tone: "mint",
  },
  {
    id: "shapeSort",
    kind: "game",
    category: "think",
    label: "Shape sort",
    emoji: "🔺",
    blurb: "Post each shape into the hole that fits",
    tone: "coral",
  },

  // --- Play ----------------------------------------------------------------
  {
    id: "shapePop",
    kind: "game",
    category: "play",
    label: "Pop",
    emoji: "🫧",
    blurb: "Pop the shapes as they float by",
    tone: "sky",
  },
  {
    id: "peekaboo",
    kind: "game",
    category: "play",
    label: "Peekaboo",
    emoji: "🙈",
    blurb: "Tap the animals as they peep out",
    tone: "coral",
  },
  {
    id: "catchStars",
    kind: "game",
    category: "play",
    label: "Catch",
    emoji: "⭐",
    blurb: "Catch the falling stars",
    tone: "sun",
  },

  // --- Create --------------------------------------------------------------
  {
    id: "coloring",
    kind: "game",
    category: "create",
    label: "Colouring",
    emoji: "🖍️",
    blurb: "Pick a colour and fill in the picture",
    tone: "bubblegum",
  },
  {
    id: "stickers",
    kind: "game",
    category: "create",
    label: "Stickers",
    emoji: "🌟",
    blurb: "Pick a sticker and place it in the scene",
    tone: "sun",
  },

  // --- Music ---------------------------------------------------------------
  {
    id: "piano",
    kind: "game",
    category: "music",
    label: "Piano",
    emoji: "🎹",
    blurb: "Play the keys and hear the notes",
    tone: "grape",
  },
  {
    id: "drums",
    kind: "game",
    category: "music",
    label: "Drums",
    emoji: "🥁",
    blurb: "Tap the pads and make a beat",
    tone: "coral",
  },
  {
    id: "copyTune",
    kind: "game",
    category: "music",
    label: "Copy me",
    emoji: "🎼",
    blurb: "Listen to the tune, then play it back",
    tone: "sun",
  },
  {
    id: "rhymes",
    kind: "game",
    category: "music",
    label: "Rhymes",
    emoji: "📖",
    blurb: "Nursery rhymes read out loud",
    tone: "bubblegum",
  },
];

export const byCategory = (categoryId) =>
  ACTIVITIES.filter((a) => a.category === categoryId);

export const byId = (id) => ACTIVITIES.find((a) => a.id === id) || null;

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || null;

export default ACTIVITIES;
