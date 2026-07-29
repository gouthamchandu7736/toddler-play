import { APP_NAME, APP_SHORT } from "../appInfo.js";
import iconSmall from "../assets/art/app-icon-96.png";
import iconLarge from "../assets/art/app-icon-192.png";

/**
 * The app icon and name, shown inside the app.
 *
 * Three rules govern this component:
 *
 * 1. It is NEVER interactive. `pointer-events: none` in the CSS means a tap
 *    that lands on the badge passes straight through to whatever is beneath.
 *    A branding element that swallowed a tap would be a dead tap, which
 *    PLAN.md Section 2 rule 2 forbids outright.
 * 2. The name is for the grown-up, not the child — she can't read it. So it
 *    never takes space away from something tappable; the play grids reserve a
 *    strip for it instead of the badge floating over them.
 * 3. Imported through Vite (not referenced as a bare /icons/ path) so the
 *    asset gets hashed, precached by the service worker, and keeps working if
 *    `base` ever changes for GitHub Pages.
 *
 * @param variant "full" — big icon + full name, for the splash.
 *                "bar"  — header-sized, for the Home screen.
 *                "mini" — compact badge, for scenes and games.
 */
export default function Brand({ variant = "mini" }) {
  const large = variant === "full";
  return (
    <div className={`brand brand-${variant}`}>
      <img
        className="brand-icon"
        src={large ? iconLarge : iconSmall}
        alt=""
        width={large ? 192 : 96}
        height={large ? 192 : 96}
        draggable="false"
      />
      <span className="brand-name">
        {variant === "mini" ? APP_SHORT : APP_NAME}
      </span>
    </div>
  );
}
