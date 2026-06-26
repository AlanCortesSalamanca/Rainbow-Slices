import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class InventoryRepository {
  async listFinishedStock() {
    const { data, error } = await supabase.from('vw_product_stock').select('*').order('name');
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async listIngredientStock() {
    const { data, error } = await supabase.from('vw_ingredient_stock').select('*').order('name');
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async createFinishedMovement(payload: Record<string, unknown>) {
    const { data, error } = await supabase.from('finished_inventory_movements').insert(payload).select('*').single();
    if (error) throw new ApiError(400, error.message, error);
    return data;
  }
}

export const inventoryRepository = new InventoryRepository();
