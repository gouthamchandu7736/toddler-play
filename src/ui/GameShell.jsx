import PlayfulBackground from "./PlayfulBackground.jsx";
import TopBar from "./TopBar.jsx";

/**
 * The frame every game sits in: background, header, and a content area.
 *
 * Before this existed each game positioned its own floating Home button and
 * its own backdrop, which is how the Home button ended up overlapping a play
 * tile twice. Now the chrome is declared once and the content area is a
 * flex child that simply cannot run underneath it.
 */
export default function GameShell({
  title,
  tone = "play",
  onHome,
  onSettings,
  right = null,
  className = "",
  children,
}) {
  return (
    <div className={`screen game-screen cat-bg-${tone} ${className}`}>
      <PlayfulBackground variant={tone} />
      <TopBar title={title} onBack={onHome} onSettings={onSettings} tone={tone} right={right} />
      <div className="game-body">{children}</div>
    </div>
  );
}
