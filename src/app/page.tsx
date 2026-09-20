"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sumFoods } from "@/lib/nutrition";
import { FoodEntry, Meal } from "@/types";
import { todayKey } from "@/lib/date";
import * as api from "@/lib/api";
import { upsertManualFoodItem } from "@/lib/foods";
import TotalsSummary from "@/components/TotalsSummary";
import MealCard from "@/components/MealCard";
import DateNav from "@/components/DateNav";

export default function Home() {
  const [date, setDate] = useState(todayKey());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .fetchDay(date)
      .then((data) => {
        if (!cancelled) setMeals(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this day. Check your connection and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const runMutation = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch {
      setError("Something went wrong saving that change. Please try again.");
    }
  };

  const addMeal = () =>
    runMutation(async () => {
      const meal = await api.createMeal(date, "New meal");
      setMeals((m) => [...m, meal]);
    });

  const renameMeal = (mealId: string, name: string) => {
    setMeals((m) => m.map((meal) => (meal.id === mealId ? { ...meal, name } : meal)));
    runMutation(() => api.renameMeal(mealId, name));
  };

  const removeMeal = (mealId: string) =>
    runMutation(async () => {
      await api.deleteMeal(mealId);
      setMeals((m) => m.filter((meal) => meal.id !== mealId));
    });

  const addFood = (mealId: string, food: Omit<FoodEntry, "id">, fromCatalog: boolean) =>
    runMutation(async () => {
      const created = await api.createFood(mealId, food);
      setMeals((m) =>
        m.map((meal) =>
          meal.id === mealId ? { ...meal, foods: [...meal.foods, created] } : meal
        )
      );
      if (!fromCatalog) {
        upsertManualFoodItem({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          fibre: food.fibre,
        }).catch(() => {
          // The entry itself saved fine; syncing it into the catalog is best-effort.
        });
      }
    });

  const updateFood = (mealId: string, foodId: string, food: Omit<FoodEntry, "id">) =>
    runMutation(async () => {
      const updated = await api.updateFood(foodId, food);
      setMeals((m) =>
        m.map((meal) =>
          meal.id === mealId
            ? { ...meal, foods: meal.foods.map((f) => (f.id === foodId ? updated : f)) }
            : meal
        )
      );
    });

  const removeFood = (mealId: string, foodId: string) =>
    runMutation(async () => {
      await api.deleteFood(foodId);
      setMeals((m) =>
        m.map((meal) =>
          meal.id === mealId
            ? { ...meal, foods: meal.foods.filter((f) => f.id !== foodId) }
            : meal
        )
      );
    });

  const dayTotals = sumFoods(meals.flatMap((meal) => meal.foods));

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 sm:max-w-lg">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Calorie Tracker
          </h1>
          <Link
            href="/foods"
            className="text-sm font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Foods
          </Link>
        </header>

        <DateNav date={date} onChange={setDate} />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <TotalsSummary title="Total" totals={dayTotals} />
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">Loading…</p>
        ) : (
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
                onAddFood={(food, fromCatalog) => addFood(meal.id, food, fromCatalog)}
                onUpdateFood={(foodId, food) => updateFood(meal.id, foodId, food)}
                onRemoveFood={(foodId) => removeFood(meal.id, foodId)}
              />
            ))}
          </div>
        )}

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
