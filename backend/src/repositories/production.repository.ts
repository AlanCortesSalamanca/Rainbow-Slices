import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class ProductionRepository {
  async list() {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*, products(name, presentation)')
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async register(productId: string, batchesQuantity: number, notes?: string) {
    const { data, error } = await supabase.rpc('register_production', {
      p_product_id: productId,
      p_batches_quantity: batchesQuantity,
      p_notes: notes ?? null
    });

    if (error) throw new ApiError(400, error.message, error);
    return data;
  }

  async findById(id: string) {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*, products(id, name, presentation, pieces_per_batch)')
      .eq('id', id)
      .single();

    if (error) throw new ApiError(404, error.message, error);
    return data;
  }
}

export const productionRepository = new ProductionRepository();
