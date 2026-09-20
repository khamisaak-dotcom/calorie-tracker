export interface FoodEntry {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  sugar: number;
  fibre: number;
}

export interface Meal {
  id: string;
  name: string;
  foods: FoodEntry[];
}
