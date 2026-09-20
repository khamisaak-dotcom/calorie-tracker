import { NUTRIENT_FIELDS } from "@/lib/nutrition";
import { FoodEntry } from "@/types";

export default function FoodRow({
  food,
  onClick,
  onDelete,
}: {
  food: FoodEntry;
  onClick: () => void;
  onDelete: () => void;
}) {
  const macroSummary = NUTRIENT_FIELDS.filter((f) => f.key !== "calories")
    .map(({ key, label }) => `${label} ${food[key]}g`)
    .join(" · ");

  return (
    <div className="flex items-start justify-between gap-2 border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-800">
      <button
        type="button"
        onClick={onClick}
        className="flex-1 text-left"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {food.name}
            {food.quantity && (
              <span className="ml-1.5 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                {food.quantity}
              </span>
            )}
          </span>
          <span className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {food.calories} kcal
          </span>
        </div>
        <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
          {macroSummary}
        </div>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${food.name}`}
        className="mt-0.5 shrink-0 rounded-full p-1 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
