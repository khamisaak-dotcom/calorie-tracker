"use client";

import { useState } from "react";
import { sumFoods } from "@/lib/nutrition";
import { FoodEntry, Meal } from "@/types";
import TotalsSummary from "@/components/TotalsSummary";
import MealCard from "@/components/MealCard";

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const addMeal = () => {
    setMeals((m) => [
      ...m,
      { id: crypto.randomUUID(), name: "New meal", foods: [] },
    ]);
  };

  const renameMeal = (mealId: string, name: string) => {
    setMeals((m) => m.map((meal) => (meal.id === mealId ? { ...meal, name } : meal)));
  };

  const removeMeal = (mealId: string) => {
    setMeals((m) => m.filter((meal) => meal.id !== mealId));
  };

  const addFood = (mealId: string, food: Omit<FoodEntry, "id">) => {
    setMeals((m) =>
      m.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: [...meal.foods, { ...food, id: crypto.randomUUID() }] }
          : meal
      )
    );
  };

  const updateFood = (mealId: string, foodId: string, food: Omit<FoodEntry, "id">) => {
    setMeals((m) =>
      m.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              foods: meal.foods.map((f) =>
                f.id === foodId ? { ...food, id: foodId } : f
              ),
            }
          : meal
      )
    );
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals((m) =>
      m.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((f) => f.id !== foodId) }
          : meal
      )
    );
  };

  const dayTotals = sumFoods(meals.flatMap((meal) => meal.foods));

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 sm:max-w-lg">
        <header>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Calorie Tracker
          </h1>
        </header>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <TotalsSummary title="Today" totals={dayTotals} />
        </div>

        <div className="flex flex-col gap-3">
          {meals.length === 0 && (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
              No meals yet. Add one to start logging.
            </p>
          )}
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onRename={(name) => renameMeal(meal.id, name)}
              onRemove={() => removeMeal(meal.id)}
              onAddFood={(food) => addFood(meal.id, food)}
              onUpdateFood={(foodId, food) => updateFood(meal.id, foodId, food)}
              onRemoveFood={(foodId) => removeFood(meal.id, foodId)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addMeal}
          className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          + Add meal
        </button>
      </div>
    </div>
  );
}
