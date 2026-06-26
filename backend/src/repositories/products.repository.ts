import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { BaseRepository } from './BaseRepository';

export class ProductsRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  async getRecipeCosts(productId: string) {
    const { data, error } = await supabase.from('vw_product_recipe_costs').select('*').eq('product_id', productId).maybeSingle();
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async getAvailability(productId: string) {
    const { data, error } = await supabase.from('vw_product_availability').select('*').eq('product_id', productId).maybeSingle();
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async findBySlug(slug: string) {
    const { data, error } = await supabase.from('products').select('id, slug').eq('slug', slug).maybeSingle();
    if (error) throw new ApiError(500, error.message, error);
    return data;
  }
}

export const productsRepository = new ProductsRepository();
