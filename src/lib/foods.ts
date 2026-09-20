import { supabase } from "@/lib/supabaseClient";

export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fibrePer100g: number;
  isImported: boolean;
}

interface DbFoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fibre_per_100g: number;
  is_imported: boolean;
}

function mapFoodItem(row: DbFoodItem): FoodItem {
  return {
    id: row.id,
    name: row.name,
    caloriesPer100g: row.calories_per_100g,
    proteinPer100g: row.protein_per_100g,
    fibrePer100g: row.fibre_per_100g,
    isImported: row.is_imported,
  };
}

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from("foods")
    .select("id, name, calories_per_100g, protein_per_100g, fibre_per_100g, is_imported")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(25);

  if (error) throw error;
  return (data as DbFoodItem[]).map(mapFoodItem);
}

export async function updateFoodItem(
  id: string,
  fields: { name: string; caloriesPer100g: number; proteinPer100g: number; fibrePer100g: number }
): Promise<FoodItem> {
  const { data, error } = await supabase
    .from("foods")
    .update({
      name: fields.name,
      calories_per_100g: fields.caloriesPer100g,
      protein_per_100g: fields.proteinPer100g,
      fibre_per_100g: fields.fibrePer100g,
    })
    .eq("id", id)
    .select("id, name, calories_per_100g, protein_per_100g, fibre_per_100g, is_imported")
    .single();

  if (error) throw error;
  return mapFoodItem(data as DbFoodItem);
}

export async function upsertManualFoodItem(fields: {
  name: string;
  calories: number;
  protein: number;
  fibre: number;
}): Promise<void> {
  const { data: existing, error: findError } = await supabase
    .from("foods")
    .select("id")
    .eq("is_imported", false)
    .ilike("name", fields.name)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;

  const payload = {
    name: fields.name,
    calories_per_100g: fields.calories,
    protein_per_100g: fields.protein,
    fibre_per_100g: fields.fibre,
  };

  if (existing) {
    const { error } = await supabase.from("foods").update(payload).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("foods").insert({ ...payload, is_imported: false });
    if (error) throw error;
  }
}
