import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import "./styles/global.css";

/**
 * Install the service worker that makes the app work offline.
 *
 * immediate: true activates a new version as soon as it downloads, without
 * prompting. A "new version available, reload?" banner is meaningless to the
 * audience here, and must never appear over the play area.
 *
 * The whole call is optional: in a browser without service workers, or over
 * plain HTTP, registration throws and the app carries on online-only.
 */
try {
  registerSW({ immediate: true });
} catch {
  /* no service worker support — the app still runs, just not offline */
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
