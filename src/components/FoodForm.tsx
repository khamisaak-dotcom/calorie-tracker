"use client";

import { useState } from "react";
import { NUTRIENT_FIELDS, NutritionTotals } from "@/lib/nutrition";
import { FoodEntry } from "@/types";

type FoodFormValues = Omit<FoodEntry, "id">;

const BLANK_VALUES: FoodFormValues = {
  name: "",
  quantity: "",
  calories: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  carbs: 0,
  sugar: 0,
  fibre: 0,
};

function toFormValues(food?: FoodEntry): FoodFormValues {
  if (!food) return BLANK_VALUES;
  const { id: _id, ...rest } = food;
  return rest;
}

const inputClasses =
  "w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-white/10";

export default function FoodForm({
  initialValues,
  onSubmit,
  onCancel,
}: {
  initialValues?: FoodEntry;
  onSubmit: (values: FoodFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FoodFormValues>(
    toFormValues(initialValues)
  );

  const setNutrient = (key: keyof NutritionTotals, raw: string) => {
    setValues((v) => ({ ...v, [key]: raw === "" ? 0 : Number(raw) }));
  };

  const nutrientDisplay = (key: keyof NutritionTotals) =>
    values[key] === 0 ? "" : String(values[key]);

  const canSave = values.name.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave) return;
        onSubmit({ ...values, name: values.name.trim() });
      }}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="grid grid-cols-2 gap-2">
        <input
          autoFocus
          className={inputClasses}
          placeholder="Food name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <input
          className={inputClasses}
          placeholder="Quantity (e.g. 200g)"
          value={values.quantity}
          onChange={(e) =>
            setValues((v) => ({ ...v, quantity: e.target.value }))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {NUTRIENT_FIELDS.map(({ key, label, unit }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {label} ({unit})
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              className={inputClasses}
              placeholder="0"
              value={nutrientDisplay(key)}
              onChange={(e) => setNutrient(key, e.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSave}
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
    </form>
  );
}
