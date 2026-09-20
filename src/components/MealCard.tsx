"use client";

import { useState } from "react";
import { sumFoods } from "@/lib/nutrition";
import { FoodEntry, Meal } from "@/types";
import TotalsSummary from "./TotalsSummary";
import FoodRow from "./FoodRow";
import FoodForm from "./FoodForm";

type FormMode = { type: "add" } | { type: "edit"; foodId: string } | null;

export default function MealCard({
  meal,
  onRename,
  onRemove,
  onAddFood,
  onUpdateFood,
  onRemoveFood,
}: {
  meal: Meal;
  onRename: (name: string) => void;
  onRemove: () => void;
  onAddFood: (food: Omit<FoodEntry, "id">, fromCatalog: boolean) => void;
  onUpdateFood: (foodId: string, food: Omit<FoodEntry, "id">) => void;
  onRemoveFood: (foodId: string) => void;
  }) {
  const [formMode, setFormMode] = useState<FormMode>(null);

  const editingFood =
    formMode?.type === "edit"
      ? meal.foods.find((f) => f.id === formMode.foodId)
      : undefined;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <input
          value={meal.name}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Meal name"
          className="min-w-0 flex-1 truncate bg-transparent text-base font-semibold text-zinc-900 focus:outline-none dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Delete ${meal.name || "meal"}`}
          className="shrink-0 rounded-full p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4.5 w-4.5"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {meal.foods.length > 0 && (
        <div className="mt-2">
          <TotalsSummary title="Subtotal" totals={sumFoods(meal.foods)} compact />
        </div>
      )}

      <div className="mt-3">
        {meal.foods.length === 0 && formMode === null && (
          <p className="py-1 text-sm text-zinc-400 dark:text-zinc-500">
            No foods logged yet.
          </p>
        )}
        {meal.foods.map((food) => (
          <FoodRow
            key={food.id}
            food={food}
            onClick={() => setFormMode({ type: "edit", foodId: food.id })}
            onDelete={() => onRemoveFood(food.id)}
          />
        ))}
      </div>

      {formMode?.type === "add" && (
        <div className="mt-3">
          <FoodForm
            onSubmit={(values, fromCatalog) => {
              onAddFood(values, fromCatalog);
              setFormMode(null);
            }}
            onCancel={() => setFormMode(null)}
          />
        </div>
      )}

      {formMode?.type === "edit" && editingFood && (
        <div className="mt-3">
          <FoodForm
            initialValues={editingFood}
            onSubmit={(values) => {
              onUpdateFood(editingFood.id, values);
              setFormMode(null);
            }}
            onCancel={() => setFormMode(null)}
          />
        </div>
      )}

      {formMode === null && (
        <button
          type="button"
          onClick={() => setFormMode({ type: "add" })}
          className="mt-3 w-full rounded-full border border-dashed border-zinc-300 py-2 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
        >
          + Add food
        </button>
      )}
    </div>
  );
}
