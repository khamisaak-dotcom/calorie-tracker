import { addDays, todayKey } from "@/lib/date";

export default function DateNav({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  const isToday = date === todayKey();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Previous day"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-500 shadow-sm transition-colors hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ←
      </button>

      <div className="relative flex-1">
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="w-full rounded-full border border-black/5 bg-white px-3 py-1.5 text-center text-sm font-medium text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-white/10 [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>

      <button
        type="button"
        onClick={() => onChange(addDays(date, 1))}
        aria-label="Next day"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-500 shadow-sm transition-colors hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        →
      </button>

      {!isToday && (
        <button
          type="button"
          onClick={() => onChange(todayKey())}
          className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Today
        </button>
      )}
    </div>
  );
}
