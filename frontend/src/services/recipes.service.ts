import { apiClient } from './apiClient';
import type { RecipeItem } from '../types/recipe.types';

export const recipesService = {
  getByProduct: (productId: string) => apiClient.get<RecipeItem[]>(`/products/${productId}/recipe`),
  save: (productId: string, items: Array<{ ingredient_id: string; quantity_required: number }>) => apiClient.put<RecipeItem[]>(`/products/${productId}/recipe`, { items }),
  removeItem: (productId: string, recipeItemId: string) => apiClient.delete<void>(`/products/${productId}/recipe/${recipeItemId}`)
};
