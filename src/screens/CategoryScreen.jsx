import TopBar from "../ui/TopBar.jsx";
import PlayfulBackground from "../ui/PlayfulBackground.jsx";
import GameCard from "../ui/GameCard.jsx";
import { byCategory, getCategory } from "../data/catalog.js";

/**
 * One category's activities, as cards.
 *
 * Every category is capped at six activities so the grid always fits without
 * scrolling, at every screen size. If a category ever outgrows six, the fix is
 * to split it — not to let the page scroll, because scrolling is exactly what
 * this app disables to keep a toddler inside the play area.
 */
export default function CategoryScreen({
  categoryId,
  onOpenActivity,
  onBack,
  onSettings,
  isFavourite,
  onToggleFavourite,
}) {
  const category = getCategory(categoryId);
  const activities = byCategory(categoryId);

  return (
    <div className={`screen category-screen cat-bg-${category?.tone ?? "play"}`}>
      <PlayfulBackground variant={category?.tone ?? "sky"} />
      <TopBar
        title={category?.label}
        onBack={onBack}
        onSettings={onSettings}
        tone={category?.tone}
      />

      <div className="card-grid">
        {activities.map((a, i) => (
          <GameCard
            key={a.id}
            activity={a}
            index={i}
            onOpen={onOpenActivity}
            isFavourite={isFavourite(a.id)}
            onToggleFavourite={onToggleFavourite}
          />
        ))}
      </div>
    </div>
  );
}
