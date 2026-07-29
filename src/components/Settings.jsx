import { useState } from "react";
import { isMuted, setMuted, playSfx } from "../audio/audioManager.js";

/**
 * The grown-up panel. Only reachable after clearing ParentGate.
 *
 * Intentionally tiny in scope: this is the one screen in the app where reading
 * is expected, so everything here must be something a parent actually needs
 * mid-session.
 */
export default function Settings({ onClose }) {
  const [muted, setMutedState] = useState(isMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSfx("pop");
  };

  return (
    <div className="screen settings">
      <div className="settings-card">
        <h2>Grown-up settings</h2>

        <button type="button" className="settings-row" onClick={toggleSound}>
          <span>{muted ? "🔇" : "🔊"}</span>
          <span>Sound {muted ? "off" : "on"}</span>
        </button>

        <p className="settings-note">
          This app is fully offline. It makes no network requests, collects no
          data, and contains no ads, purchases or links.
        </p>

        <p className="settings-note">
          To close the app entirely, use your phone&apos;s home button or app
          switcher — a web app cannot close itself.
        </p>

        <button type="button" className="settings-done" onClick={onClose}>
          Back to play
        </button>
      </div>
    </div>
  );
}
