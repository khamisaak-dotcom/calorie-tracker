import { supabase } from "@/lib/supabaseClient";
import { FoodEntry, Meal } from "@/types";

interface DbFoodEntry {
  id: string;
  meal_id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  fat: number;
  saturated_fat: number;
  carbs: number;
  sugar: number;
  fibre: number;
}

interface DbMeal {
  id: string;
  date: string;
  name: string;
  food_entries: DbFoodEntry[];
}

function mapFood(row: DbFoodEntry): FoodEntry {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    calories: row.calories,
    protein: row.protein,
    fat: row.fat,
    saturatedFat: row.saturated_fat,
    carbs: row.carbs,
    sugar: row.sugar,
    fibre: row.fibre,
  };
}

function mapMeal(row: DbMeal): Meal {
  return {
    id: row.id,
    name: row.name,
    foods: row.food_entries.map(mapFood),
  };
}

function foodToDbFields(food: Omit<FoodEntry, "id">) {
  return {
    name: food.name,
    quantity: food.quantity,
    calories: food.calories,
    protein: food.protein,
    fat: food.fat,
    saturated_fat: food.saturatedFat,
    carbs: food.carbs,
    sugar: food.sugar,
    fibre: food.fibre,
  };
}

export async function fetchDay(date: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from("meals")
    .select("id, date, name, food_entries(*)")
    .eq("date", date)
    .order("created_at", { ascending: true })
    .order("created_at", { referencedTable: "food_entries", ascending: true });

  if (error) throw error;
  return (data as unknown as DbMeal[]).map(mapMeal);
}

export async function createMeal(date: string, name: string): Promise<Meal> {
  const { data, error } = await supabase
    .from("meals")
    .insert({ date, name })
    .select("id, date, name")
    .single();

  if (error) throw error;
  return { id: data.id, name: data.name, foods: [] };
}

export async function renameMeal(id: string, name: string): Promise<void> {
  const { error } = await supabase.from("meals").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw error;
}

export async function createFood(
  mealId: string,
  food: Omit<FoodEntry, "id">
): Promise<FoodEntry> {
  const { data, error } = await supabase
    .from("food_entries")
    .insert({ meal_id: mealId, ...foodToDbFields(food) })
    .select("*")
    .single();

  if (error) throw error;
  return mapFood(data as DbFoodEntry);
}

export async function updateFood(
  id: string,
  food: Omit<FoodEntry, "id">
): Promise<FoodEntry> {
  const { data, error } = await supabase
    .from("food_entries")
    .update(foodToDbFields(food))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapFood(data as DbFoodEntry);
}

export async function deleteFood(id: string): Promise<void> {
  const { error } = await supabase.from("food_entries").delete().eq("id", id);
  if (error) throw error;
}
