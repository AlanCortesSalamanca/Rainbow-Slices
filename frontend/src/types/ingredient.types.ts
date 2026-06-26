export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  minimum_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IngredientStock {
  ingredient_id: string;
  name: string;
  unit: string;
  minimum_stock: number;
  current_stock: number;
  is_low_stock: boolean;
}
