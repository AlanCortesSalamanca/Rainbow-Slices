import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { BaseRepository } from './BaseRepository';

export class IngredientsRepository extends BaseRepository {
  constructor() {
    super('ingredients');
  }

  async addStock(ingredientId: string, quantity: number, totalCost: number, notes?: string) {
    const { error } = await supabase.rpc('add_ingredient_stock', {
      p_ingredient_id: ingredientId,
      p_quantity: quantity,
      p_total_cost: totalCost,
      p_notes: notes ?? null
    });

    if (error) throw new ApiError(400, error.message, error);
  }
}

export const ingredientsRepository = new IngredientsRepository();
