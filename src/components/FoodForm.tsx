"use client";

import { useEffect, useState } from "react";
import { NUTRIENT_FIELDS, NutritionTotals } from "@/lib/nutrition";
import { FoodEntry } from "@/types";
import { FoodItem, searchFoodItems } from "@/lib/foods";

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

function scaleFromCatalog(food: FoodItem, grams: number) {
  const scale = grams / 100;
  const round1 = (n: number) => Math.round(n * scale * 10) / 10;
  return {
    calories: Math.round(food.caloriesPer100g * scale),
    protein: round1(food.proteinPer100g),
    fat: round1(food.fatPer100g),
    saturatedFat: round1(food.saturatedFatPer100g),
    carbs: round1(food.carbsPer100g),
    sugar: round1(food.sugarPer100g),
    fibre: round1(food.fibrePer100g),
  };
}

const inputClasses =
  "w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-white/10";

export default function FoodForm({
  initialValues,
  onSubmit,
  onCancel,
}: {
  initialValues?: FoodEntry;
  onSubmit: (values: FoodFormValues, fromCatalog: boolean) => void;
  onCancel: () => void;
}) {
  const isAdding = !initialValues;
  const [values, setValues] = useState<FoodFormValues>(toFormValues(initialValues));
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [gramsInput, setGramsInput] = useState("");

  useEffect(() => {
    if (!isAdding || selectedFood || values.name.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchFoodItems(values.name.trim())
        .then((found) => {
          if (!cancelled) setResults(found);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAdding, selectedFood, values.name]);

  const setNutrient = (key: keyof NutritionTotals, raw: string) => {
    setValues((v) => ({ ...v, [key]: raw === "" ? 0 : Number(raw) }));
  };

  const nutrientDisplay = (key: keyof NutritionTotals) =>
    values[key] === 0 ? "" : String(values[key]);

  const pickFood = (food: FoodItem) => {
    setSelectedFood(food);
    setResults([]);
    setGramsInput("");
    setValues((v) => ({ ...v, name: food.name }));
  };

  const clearSelection = () => {
    setSelectedFood(null);
    setGramsInput("");
  };

  const onGramsChange = (raw: string) => {
    setGramsInput(raw);
    if (!selectedFood) return;
    const grams = raw === "" ? 0 : Number(raw);
    setValues((v) => ({
      ...v,
      ...scaleFromCatalog(selectedFood, grams),
      quantity: raw === "" ? "" : `${raw}g`,
    }));
  };

  const canSave = values.name.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave) return;
        onSubmit({ ...values, name: values.name.trim() }, selectedFood !== null);
      }}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
    >
      {isAdding && selectedFood ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
          <span className="truncate text-sm text-zinc-900 dark:text-zinc-50">
            {selectedFood.name}
            <span className="ml-1.5 text-xs text-zinc-400">
              {selectedFood.isImported ? "USDA" : "your food"}
            </span>
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            autoFocus
            className={inputClasses}
            placeholder={isAdding ? "Search or type a food name" : "Food name"}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            autoComplete="off"
          />
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              {results.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => pickFood(food)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-700"
                >
                  <span className="truncate">{food.name}</span>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {food.caloriesPer100g} kcal/100g
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isAdding && selectedFood ? (
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          className={inputClasses}
          placeholder="Grams"
          value={gramsInput}
          onChange={(e) => onGramsChange(e.target.value)}
        />
      ) : (
        <input
          className={inputClasses}
          placeholder="Quantity (e.g. 200g)"
          value={values.quantity}
          onChange={(e) => setValues((v) => ({ ...v, quantity: e.target.value }))}
        />
      )}

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
