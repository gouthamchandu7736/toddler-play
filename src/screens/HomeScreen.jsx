import { motion } from "framer-motion";
import TopBar from "../ui/TopBar.jsx";
import PlayfulBackground from "../ui/PlayfulBackground.jsx";
import Icon from "../ui/Icon.jsx";
import { CATEGORIES, byId } from "../data/catalog.js";
import { playSfx, speak, vibrate } from "../audio/audioManager.js";

/**
 * Home: six category doors, plus shortcut rows for favourites and recent play.
 *
 * Why categories rather than one wall of 20 games:
 *
 * The app has 20 activities and it must never scroll — overscroll and
 * pull-to-refresh are disabled precisely so a toddler can't swipe her way out
 * of the play area. Twenty tiles on one non-scrolling screen would be twenty
 * tiles too small to hit. Six doors keep every target enormous, and the
 * shortcut rows mean her usual games are still one tap away, so grouping
 * costs her nothing in practice.
 */
export default function HomeScreen({
  onOpenCategory,
  onOpenActivity,
  onSettings,
  favourites = [],
  recents = [],
}) {
  const openCategory = (cat) => {
    playSfx("woosh");
    vibrate(25);
    speak(cat.label);
    onOpenCategory(cat.id);
  };

  const shortcuts = [
    { key: "fav", icon: "star", title: "Favourites", ids: favourites.slice(0, 5) },
    { key: "recent", icon: "clock", title: "Played recently", ids: recents.slice(0, 5) },
  ].filter((row) => row.ids.length > 0);

  return (
    <div className="screen home-screen">
      <PlayfulBackground variant="sky" />
      <TopBar onSettings={onSettings} />

      <div className="home-body">
        <div className="cat-grid">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              type="button"
              className={`cat-tile tappable cat-${cat.tone}`}
              initial={{ opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileTap={{ scale: 0.95, y: 3 }}
              onPointerDown={() => openCategory(cat)}
              onClick={(e) => e.preventDefault()}
              aria-label={`${cat.label}. ${cat.blurb}`}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{cat.label}</span>
              <span className="cat-blurb">{cat.blurb}</span>
            </motion.button>
          ))}
        </div>

        {shortcuts.map((row) => (
          <section key={row.key} className="shortcut-row">
            <h2 className="shortcut-title">
              <Icon name={row.icon} size={18} filled={row.key === "fav"} />
              {row.title}
            </h2>
            <div className="shortcut-items">
              {row.ids.map((id) => {
                const a = byId(id);
                if (!a) return null; // an activity that no longer exists
                return (
                  <motion.button
                    key={id}
                    type="button"
                    className={`chip tappable card-${a.tone}`}
                    whileTap={{ scale: 0.92 }}
                    onPointerDown={() => {
                      playSfx("woosh");
                      vibrate(20);
                      speak(a.label);
                      onOpenActivity(a);
                    }}
                    onClick={(e) => e.preventDefault()}
                    aria-label={a.label}
                  >
                    <span className="chip-emoji">{a.emoji}</span>
                    <span className="chip-label">{a.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
