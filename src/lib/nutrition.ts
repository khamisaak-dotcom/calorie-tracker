import { FoodEntry } from "@/types";

export type NutritionTotals = Omit<FoodEntry, "id" | "name" | "quantity">;

export const NUTRIENT_FIELDS: {
  key: keyof NutritionTotals;
  label: string;
  unit: string;
}[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "saturatedFat", label: "Saturated fat", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "sugar", label: "Sugar", unit: "g" },
  { key: "fibre", label: "Fibre", unit: "g" },
];

export const EMPTY_TOTALS: NutritionTotals = {
  calories: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  carbs: 0,
  sugar: 0,
  fibre: 0,
};

export function sumFoods(foods: FoodEntry[]): NutritionTotals {
  return foods.reduce<NutritionTotals>((totals, food) => {
    const next = { ...totals };
    for (const { key } of NUTRIENT_FIELDS) {
      next[key] = totals[key] + food[key];
    }
    return next;
  }, { ...EMPTY_TOTALS });
}
