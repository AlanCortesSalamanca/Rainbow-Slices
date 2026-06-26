import { recipesRepository } from '../repositories/recipes.repository';

export class RecipesService {
  getByProduct(productId: string) {
    return recipesRepository.listByProduct(productId);
  }

  replace(productId: string, items: Array<{ ingredient_id: string; quantity_required: number }>) {
    return recipesRepository.replaceRecipe(productId, items);
  }

  deleteItem(productId: string, recipeItemId: string) {
    return recipesRepository.deleteRecipeItem(productId, recipeItemId);
  }
}

export const recipesService = new RecipesService();
