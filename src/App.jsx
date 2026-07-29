import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import useNoGestures from "./hooks/useNoGestures.js";
import useWakeLock from "./hooks/useWakeLock.js";
import useStoredList from "./hooks/useStoredList.js";
import { SCREENS } from "./screens.js";

import Splash from "./components/Splash.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import CategoryScreen from "./screens/CategoryScreen.jsx";
import Scene from "./components/Scene.jsx";
import ParentGate from "./components/ParentGate.jsx";
import Settings from "./components/Settings.jsx";

import FindColor from "./games/FindColor.jsx";
import ShapePop from "./games/ShapePop.jsx";
import CopyTune from "./games/CopyTune.jsx";
import LearnLetters from "./games/LearnLetters.jsx";
import LearnNumbers from "./games/LearnNumbers.jsx";
import FindIt from "./games/FindIt.jsx";
import MemoryMatch from "./games/MemoryMatch.jsx";
import ShadowMatch from "./games/ShadowMatch.jsx";
import Peekaboo from "./games/Peekaboo.jsx";
import CatchStars from "./games/CatchStars.jsx";
import Coloring from "./games/Coloring.jsx";
import Piano from "./games/Piano.jsx";
import Rhymes from "./games/Rhymes.jsx";
import Tracing from "./games/Tracing.jsx";
import Opposites from "./games/Opposites.jsx";
import Patterns from "./games/Patterns.jsx";
import ShapeSort from "./games/ShapeSort.jsx";
import Drums from "./games/Drums.jsx";
import Stickers from "./games/Stickers.jsx";

import SCENES from "./data/scenes.js";
import { byId } from "./data/catalog.js";
import { stopSpeech } from "./audio/audioManager.js";
import "./styles/global.css";

/**
 * Screen state is one object: `{ screen, payload }`.
 *
 * There is still no router. History entries mean a browser back button, and a
 * back button is a way out of the play area — the one thing the parent gate
 * exists to prevent.
 */
const INITIAL_STATE = { screen: SCREENS.SPLASH, payload: null };

/**
 * Registry mapping a catalogue id to its component. Adding an activity is one
 * entry here plus one entry in data/catalog.js; scenes need neither, only an
 * array in data/scenes.js.
 */
const GAMES = {
  letters: LearnLetters,
  numbers: LearnNumbers,
  findIt: FindIt,
  findColor: FindColor,
  shapePop: ShapePop,
  copyTune: CopyTune,
  memoryMatch: MemoryMatch,
  shadowMatch: ShadowMatch,
  peekaboo: Peekaboo,
  catchStars: CatchStars,
  coloring: Coloring,
  piano: Piano,
  rhymes: Rhymes,
  tracing: Tracing,
  opposites: Opposites,
  patterns: Patterns,
  shapeSort: ShapeSort,
  drums: Drums,
  stickers: Stickers,
};

export default function App() {
  useNoGestures();
  useWakeLock(true);

  const [{ screen, payload }, setState] = useState(INITIAL_STATE);

  // Both lists are device-local (see useStoredList) — nothing is transmitted.
  const favourites = useStoredList("aditi:favourites", { max: 12 });
  const recents = useStoredList("aditi:recents", { max: 8 });

  // Grown-up flow, kept out of the screen machine so it can overlay anything
  // without disturbing what the child was playing.
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const go = useCallback((nextScreen, nextPayload = null) => {
    // Changing screen mid-sentence would leave the app talking about something
    // no longer visible.
    stopSpeech();
    setState({ screen: nextScreen, payload: nextPayload });
  }, []);

  const goHome = useCallback(() => go(SCREENS.HOME), [go]);

  const openActivity = useCallback(
    (activity) => {
      recents.push(activity.id);
      go(activity.kind === "scene" ? SCREENS.SCENE : SCREENS.GAME, activity.id);
    },
    [go, recents],
  );

  /** Where "back" goes from an activity: to its category, not all the way home. */
  const backFromActivity = useCallback(() => {
    const activity = byId(payload);
    if (activity) go(SCREENS.CATEGORY, activity.category);
    else goHome();
  }, [payload, go, goHome]);

  const openSettings = useCallback(() => setGateOpen(true), []);

  const scene = SCENES[payload];
  const Game = GAMES[payload];

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${screen}:${payload ?? ""}`}
          className="screen-wrap"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {screen === SCREENS.SPLASH && <Splash onStart={goHome} />}

          {screen === SCREENS.HOME && (
            <HomeScreen
              onOpenCategory={(id) => go(SCREENS.CATEGORY, id)}
              onOpenActivity={openActivity}
              onSettings={openSettings}
              favourites={favourites.items}
              recents={recents.items}
            />
          )}

          {screen === SCREENS.CATEGORY && (
            <CategoryScreen
              categoryId={payload}
              onOpenActivity={openActivity}
              onBack={goHome}
              onSettings={openSettings}
              isFavourite={favourites.has}
              onToggleFavourite={favourites.toggle}
            />
          )}

          {screen === SCREENS.SCENE &&
            (scene ? (
              <Scene
                title={byId(payload)?.label}
                characters={scene.characters}
                onHome={backFromActivity}
                onSettings={openSettings}
              />
            ) : (
              <Missing onHome={goHome} />
            ))}

          {screen === SCREENS.GAME &&
            (Game ? (
              <Game onHome={backFromActivity} onSettings={openSettings} />
            ) : (
              <Missing onHome={goHome} />
            ))}
        </motion.div>
      </AnimatePresence>

      {gateOpen && (
        <ParentGate
          onUnlocked={() => {
            setGateOpen(false);
            setSettingsOpen(true);
          }}
          onDismiss={() => setGateOpen(false)}
        />
      )}

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

/**
 * Shown if a payload ever names content that doesn't exist. A child must never
 * meet a blank screen with no way back.
 */
function Missing({ onHome }) {
  return (
    <div className="screen missing-screen">
      <button
        type="button"
        className="tappable missing-home"
        onPointerDown={onHome}
        onClick={(e) => e.preventDefault()}
        aria-label="Home"
      >
        🏠
      </button>
    </div>
  );
}
