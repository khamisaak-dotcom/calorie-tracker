import { NUTRIENT_FIELDS, NutritionTotals } from "@/lib/nutrition";

export default function TotalsSummary({
  title,
  totals,
  compact = false,
}: {
  title: string;
  totals: NutritionTotals;
  compact?: boolean;
}) {
  return (
    <div>
      <div
        className={
          compact
            ? "text-xs font-medium text-zinc-500 dark:text-zinc-400"
            : "text-sm font-medium text-zinc-500 dark:text-zinc-400"
        }
      >
        {title}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {NUTRIENT_FIELDS.map(({ key, label, unit }) => (
          <div key={key} className="flex items-baseline gap-1">
            <span
              className={
                key === "calories"
                  ? compact
                    ? "text-sm font-semibold text-zinc-900 dark:text-zinc-50"
                    : "text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                  : "text-sm font-medium text-zinc-700 dark:text-zinc-300"
              }
            >
              {Math.round(totals[key] * 10) / 10}
              <span className="ml-0.5 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                {unit}
              </span>
            </span>
            {key !== "calories" && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
