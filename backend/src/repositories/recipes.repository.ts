import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export class RecipesRepository {
  async listByProduct(productId: string) {
    const { data, error } = await supabase
      .from('product_recipes')
      .select('*, ingredients(*)')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async replaceRecipe(productId: string, items: Array<{ ingredient_id: string; quantity_required: number }>) {
    const { error: deleteError } = await supabase.from('product_recipes').delete().eq('product_id', productId);
    if (deleteError) throw new ApiError(400, deleteError.message, deleteError);

    if (items.length === 0) return [];

    const rows = items.map((item) => ({ ...item, product_id: productId }));
    const { data, error } = await supabase.from('product_recipes').insert(rows).select('*');
    if (error) throw new ApiError(400, error.message, error);
    return data;
  }

  async deleteRecipeItem(productId: string, recipeItemId: string) {
    const { error } = await supabase.from('product_recipes').delete().eq('id', recipeItemId).eq('product_id', productId);
    if (error) throw new ApiError(400, error.message, error);
  }
}

export const recipesRepository = new RecipesRepository();
