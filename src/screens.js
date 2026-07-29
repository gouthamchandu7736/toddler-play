/**
 * Screen states for the whole app.
 *
 * There is no router on purpose — a toddler must never be able to reach a URL
 * bar or a back button, and history entries invite exactly that.
 *
 * Lives in its own module (not App.jsx) so React Fast Refresh keeps working:
 * a file that exports both components and constants loses HMR.
 */
export const SCREENS = {
  SPLASH: "splash",
  HOME: "home",
  SCENE: "scene",
  GAME: "game",
};
