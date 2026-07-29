/**
 * The app's identity, in one place.
 *
 * Kept out of the components so the name shown in-app can never drift from the
 * name in the PWA manifest — if you rename the app, change it here AND in
 * `vite.config.js` (the manifest is generated at build time and can't import
 * from src).
 */
export const APP_NAME = "Aditi's Playhouse";

/** Short form for cramped spots — matches manifest `short_name`. */
export const APP_SHORT = "Aditi";
