"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FoodItem, searchFoodItems, updateFoodItem } from "@/lib/foods";

const inputClasses =
  "w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-white/10";

const PER_100G_FIELDS = [
  { key: "caloriesPer100g", label: "Calories/100g" },
  { key: "proteinPer100g", label: "Protein/100g" },
  { key: "fatPer100g", label: "Fat/100g" },
  { key: "saturatedFatPer100g", label: "Saturated fat/100g" },
  { key: "carbsPer100g", label: "Carbs/100g" },
  { key: "sugarPer100g", label: "Sugar/100g" },
  { key: "fibrePer100g", label: "Fibre/100g" },
] as const;

type Per100gKey = (typeof PER_100G_FIELDS)[number]["key"];

function EditForm({
  food,
  onSaved,
  onCancel,
}: {
  food: FoodItem;
  onSaved: (updated: FoodItem) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(food.name);
  const [values, setValues] = useState<Record<Per100gKey, string>>(
    Object.fromEntries(PER_100G_FIELDS.map(({ key }) => [key, String(food[key])])) as Record<
      Per100gKey,
      string
    >
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateFoodItem(food.id, {
        name: name.trim(),
        caloriesPer100g: Number(values.caloriesPer100g) || 0,
        proteinPer100g: Number(values.proteinPer100g) || 0,
        fatPer100g: Number(values.fatPer100g) || 0,
        saturatedFatPer100g: Number(values.saturatedFatPer100g) || 0,
        carbsPer100g: Number(values.carbsPer100g) || 0,
        sugarPer100g: Number(values.sugarPer100g) || 0,
        fibrePer100g: Number(values.fibrePer100g) || 0,
      });
      onSaved(updated);
    } catch {
      setError("Couldn't save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <input className={inputClasses} value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PER_100G_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className={inputClasses}
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            />
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving || name.trim().length === 0}
          className="flex-1 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function FoodsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchFoodItems(query.trim()).then((found) => {
        if (!cancelled) setResults(found);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 sm:max-w-lg">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Foods</h1>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back
          </Link>
        </header>

        <input
          autoFocus
          className={inputClasses}
          placeholder="Search foods…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          {query.trim().length < 2 && (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
              Search to find a food to view or edit.
            </p>
          )}
          {query.trim().length >= 2 && results.length === 0 && (
            <p className="py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
              No matches.
            </p>
          )}
          {results.map((food) =>
            editingId === food.id ? (
              <EditForm
                key={food.id}
                food={food}
                onSaved={(updated) => {
                  setResults((r) => r.map((f) => (f.id === updated.id ? updated : f)));
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <button
                key={food.id}
                type="button"
                onClick={() => setEditingId(food.id)}
                className="flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-3 text-left shadow-sm transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {food.name}
                  </span>
                  <span
                    className={
                      food.isImported
                        ? "shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        : "shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                    }
                  >
                    {food.isImported ? "USDA" : "Manual"}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  {food.caloriesPer100g} kcal · {food.proteinPer100g}g protein ·{" "}
                  {food.fibrePer100g}g fibre — per 100g
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
