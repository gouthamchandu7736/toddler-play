/**
 * Farm characters.
 *
 * Everything visual and audible about a character lives here as data, so
 * swapping emoji for custom SVG art later is a change to this file, not to
 * Character.jsx or Scene.jsx. Adding a Zoo or Ocean theme means a new data
 * file and nothing else.
 *
 * Fields:
 *   id        stable key
 *   label     spoken and shown name ("Cow")
 *   emoji     the art for now
 *   soundText the noise it makes, spoken after the name ("Moo")
 *   color     backdrop tint for its tile
 *   shape     used by the colour/shape games
 */

export const FARM = [
  {
    id: "cow",
    label: "Cow",
    emoji: "🐄",
    soundText: "Moo",
    color: "#f4a6a0",
    shape: "circle",
  },
  {
    id: "pig",
    label: "Pig",
    emoji: "🐖",
    soundText: "Oink",
    color: "#f7b6d2",
    shape: "circle",
  },
  {
    id: "sheep",
    label: "Sheep",
    emoji: "🐑",
    soundText: "Baa",
    color: "#cfd8dc",
    shape: "circle",
  },
  {
    id: "chicken",
    label: "Chicken",
    emoji: "🐔",
    soundText: "Cluck",
    color: "#ffd166",
    shape: "circle",
  },
  {
    id: "horse",
    label: "Horse",
    emoji: "🐴",
    soundText: "Neigh",
    color: "#d4a373",
    shape: "circle",
  },
  {
    id: "duck",
    label: "Duck",
    emoji: "🦆",
    soundText: "Quack",
    color: "#a8dadc",
    shape: "circle",
  },
];

export default FARM;
