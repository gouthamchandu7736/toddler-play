import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import useNoGestures from "./hooks/useNoGestures.js";
import useWakeLock from "./hooks/useWakeLock.js";
import { SCREENS } from "./screens.js";

import Splash from "./components/Splash.jsx";
import Home from "./components/Home.jsx";
import Scene from "./components/Scene.jsx";
import ParentGate from "./components/ParentGate.jsx";
import Settings from "./components/Settings.jsx";

import FindColor from "./games/FindColor.jsx";
import ShapePop from "./games/ShapePop.jsx";
import CopyTune from "./games/CopyTune.jsx";
import LearnLetters from "./games/LearnLetters.jsx";
import LearnNumbers from "./games/LearnNumbers.jsx";
import FindIt from "./games/FindIt.jsx";

import SCENES from "./data/scenes.js";
import { stopSpeech } from "./audio/audioManager.js";
import "./styles/global.css";

/**
 * `payload` carries which scene ("farm") or which game ("findColor") to show,
 * so adding a theme or mini-game needs no new screen state.
 */
const INITIAL_STATE = { screen: SCREENS.SPLASH, payload: null };

/**
 * Registry of playable content, keyed by the payload the Home tiles emit.
 * Adding an activity is one entry here plus one tile in Home.jsx; scenes need
 * neither, only a new array in data/scenes.js.
 */
const GAMES = {
  letters: LearnLetters,
  numbers: LearnNumbers,
  findIt: FindIt,
  findColor: FindColor,
  shapePop: ShapePop,
  copyTune: CopyTune,
};

export default function App() {
  useNoGestures();
  useWakeLock(true);

  const [{ screen, payload }, setState] = useState(INITIAL_STATE);

  // Grown-up flow, kept out of the main screen machine so it can overlay any
  // screen without disturbing what the child was playing.
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const go = useCallback((nextScreen, nextPayload = null) => {
    // A screen change while the app is mid-sentence would leave it talking
    // about something no longer on screen.
    stopSpeech();
    setState({ screen: nextScreen, payload: nextPayload });
  }, []);

  const goHome = useCallback(() => go(SCREENS.HOME), [go]);

  const handlePick = useCallback(
    (tile) => {
      go(tile.kind === "scene" ? SCREENS.SCENE : SCREENS.GAME, tile.id);
    },
    [go],
  );

  const scene = SCENES[payload];
  const Game = GAMES[payload];

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${screen}:${payload ?? ""}`}
          className="screen-wrap"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {screen === SCREENS.SPLASH && <Splash onStart={goHome} />}

          {screen === SCREENS.HOME && (
            <Home onPick={handlePick} onSettings={() => setGateOpen(true)} />
          )}

          {screen === SCREENS.SCENE &&
            (scene ? (
              <Scene
                characters={scene.characters}
                background={scene.background}
                onHome={goHome}
              />
            ) : (
              <Missing onHome={goHome} />
            ))}

          {screen === SCREENS.GAME &&
            (Game ? <Game onHome={goHome} /> : <Missing onHome={goHome} />)}
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
 * Shown if a payload ever names content that doesn't exist. A child should
 * never meet a blank screen with no way back.
 */
function Missing({ onHome }) {
  return (
    <div className="screen">
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
