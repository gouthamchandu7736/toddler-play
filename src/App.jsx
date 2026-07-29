import { useCallback, useState } from "react";
import useNoGestures from "./hooks/useNoGestures.js";
import { SCREENS } from "./screens.js";
import "./styles/global.css";

/**
 * `payload` carries which scene ("farm") or which game ("findColor") to show,
 * so adding a theme or mini-game later needs no new screen state.
 */
const INITIAL_STATE = { screen: SCREENS.SPLASH, payload: null };

export default function App() {
  useNoGestures();

  const [{ screen, payload }, setState] = useState(INITIAL_STATE);

  const go = useCallback((nextScreen, nextPayload = null) => {
    setState({ screen: nextScreen, payload: nextPayload });
  }, []);

  const goHome = useCallback(() => go(SCREENS.HOME), [go]);

  return (
    <div className="app-root">
      {/* Phase 0: placeholder screens. Later phases replace each branch
          with the real component (Splash, Home, Scene, games/*). */}
      {screen === SCREENS.SPLASH && (
        <Placeholder title="👋 Splash">
          <button onClick={goHome}>Tap to start →</button>
        </Placeholder>
      )}

      {screen === SCREENS.HOME && (
        <Placeholder title="🏠 Home">
          <button onClick={() => go(SCREENS.SCENE, "farm")}>🐄 Farm</button>
          <button onClick={() => go(SCREENS.GAME, "findColor")}>🎨 Find Color</button>
          <button onClick={() => go(SCREENS.GAME, "shapePop")}>⭐ Shape Pop</button>
          <button onClick={() => go(SCREENS.GAME, "copyTune")}>🎵 Copy Tune</button>
        </Placeholder>
      )}

      {screen === SCREENS.SCENE && (
        <Placeholder title={`🌾 Scene: ${payload}`}>
          <button onClick={goHome}>← Home</button>
        </Placeholder>
      )}

      {screen === SCREENS.GAME && (
        <Placeholder title={`🎮 Game: ${payload}`}>
          <button onClick={goHome}>← Home</button>
        </Placeholder>
      )}
    </div>
  );
}

function Placeholder({ title, children }) {
  return (
    <div className="screen">
      <div className="placeholder">
        <h1>{title}</h1>
        <div className="stub-nav">{children}</div>
      </div>
    </div>
  );
}
