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

function isWordBoundaryChar(ch: string | undefined): boolean {
  return ch === undefined || !/[a-z0-9]/i.test(ch);
}

/**
 * Lower tier = better match. Distinguishes a real match ("banana" in
 * "Bananas, raw") from the query merely being a prefix of a longer fused
 * word ("egg" in "Eggnog"), so descriptor-heavy or unrelated compound
 * words don't outrank the food someone actually searched for.
 */
function matchTier(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.toLowerCase().trim();
  if (n === q) return 0;

  const idx = n.indexOf(q);
  const isPrefix = idx === 0;
  const afterIdx = idx + q.length;
  const after = n[afterIdx];
  const leftOk = isWordBoundaryChar(n[idx - 1]);
  const rightOk = isWordBoundaryChar(after) || (after === "s" && isWordBoundaryChar(n[afterIdx + 1]));
  const isWholeWord = leftOk && rightOk;

  if (isPrefix && isWholeWord) return 1;
  if (isWholeWord) return 2;
  if (isPrefix) return 3;
  return 4;
}

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from("foods")
    .select("id, name, calories_per_100g, protein_per_100g, fibre_per_100g, is_imported")
    .ilike("name", `%${query}%`)
    .limit(500);

  if (error) throw error;

  const items = (data as DbFoodItem[]).map(mapFoodItem);
  items.sort((a, b) => {
    const tierDiff = matchTier(a.name, query) - matchTier(b.name, query);
    if (tierDiff !== 0) return tierDiff;
    const lengthDiff = a.name.length - b.name.length;
    if (lengthDiff !== 0) return lengthDiff;
    return a.name.localeCompare(b.name);
  });

  return items.slice(0, 20);
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
