import Button from "./Button.jsx";
import Brand from "../components/Brand.jsx";

/**
 * The persistent header.
 *
 * Navigation for a pre-reader has to be positional, not labelled: back is
 * always the same shape in the same corner on every screen, so it becomes
 * muscle memory rather than something to be read and understood each time.
 *
 * Deliberately NOT here: a hamburger menu, breadcrumbs, or a search field.
 * All three assume reading, and a menu that hides its contents behind a tap is
 * exactly the "small menu" PLAN.md Section 2 rule 4 rules out.
 *
 * @param title    shown to the grown-up; the child navigates by the icons
 * @param onBack   omit to hide the back button (the Home screen has nowhere
 *                 to go back to, and a button that does nothing is a dead tap)
 */
export default function TopBar({ title, onBack, onSettings, tone = "sky", right = null }) {
  return (
    <header className={`topbar topbar-${tone}`}>
      <div className="topbar-left">
        {onBack ? (
          <Button
            icon="back"
            shape="round"
            tone="ghost"
            size="md"
            label="Go back"
            sfx="woosh"
            onPress={onBack}
          />
        ) : (
          <Brand variant="mini" />
        )}
      </div>

      {title && <h1 className="topbar-title">{title}</h1>}

      <div className="topbar-right">
        {right}
        {onSettings && (
          <Button
            icon="settings"
            shape="round"
            tone="ghost"
            size="md"
            label="Grown-up settings"
            onPress={onSettings}
            className="topbar-settings"
          />
        )}
      </div>
    </header>
  );
}
