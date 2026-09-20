// One-off import of the USDA SR Legacy food database into the `foods` table.
// Usage: node scripts/import-usda-foods.mjs [path-to-csv-directory]

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env.local") });

const DATA_DIR =
  process.argv[2] ||
  "/Users/ammarkhamis/Downloads/FoodData_Central_sr_legacy_food_csv_2018-04";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function readCsv(fileName) {
  const file = fs.readFileSync(path.join(DATA_DIR, fileName));
  return parse(file, { columns: true });
}

console.log("Reading nutrient.csv...");
const nutrients = readCsv("nutrient.csv");
const energy = nutrients.find((n) => n.name === "Energy" && n.unit_name === "KCAL");
const protein = nutrients.find((n) => n.name === "Protein");
const fibre = nutrients.find((n) => n.name === "Fiber, total dietary");

if (!energy || !protein || !fibre) {
  throw new Error("Could not find one of the required nutrient rows in nutrient.csv");
}
console.log(
  `Found nutrient ids -> calories: ${energy.id}, protein: ${protein.id}, fibre: ${fibre.id}`
);

const WANTED_IDS = { [energy.id]: "calories", [protein.id]: "protein", [fibre.id]: "fibre" };

console.log("Reading food.csv...");
const foodRows = readCsv("food.csv");
const foodNames = new Map();
for (const row of foodRows) {
  if (row.data_type === "sr_legacy_food") {
    foodNames.set(row.fdc_id, row.description);
  }
}
console.log(`Found ${foodNames.size} sr_legacy_food entries`);

console.log("Reading food_nutrient.csv (this is the big one)...");
const nutrientRows = readCsv("food_nutrient.csv");
const values = new Map(); // fdc_id -> { calories, protein, fibre }
for (const row of nutrientRows) {
  const key = WANTED_IDS[row.nutrient_id];
  if (!key) continue;
  const entry = values.get(row.fdc_id) ?? { calories: 0, protein: 0, fibre: 0 };
  entry[key] = Number(row.amount) || 0;
  values.set(row.fdc_id, entry);
}

const rows = [];
for (const [fdcId, name] of foodNames) {
  const v = values.get(fdcId) ?? { calories: 0, protein: 0, fibre: 0 };
  rows.push({
    fdc_id: Number(fdcId),
    name,
    calories_per_100g: v.calories,
    protein_per_100g: v.protein,
    fibre_per_100g: v.fibre,
    is_imported: true,
  });
}
console.log(`Prepared ${rows.length} food rows, upserting in batches...`);

const BATCH_SIZE = 500;
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from("foods").upsert(batch, { onConflict: "fdc_id" });
  if (error) {
    console.error("Upsert failed:", error);
    process.exit(1);
  }
  console.log(`  ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
}

console.log("Done.");
