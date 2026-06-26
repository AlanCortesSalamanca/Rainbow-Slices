import { recipesService } from '../services/recipes.service';
import { asyncHandler } from '../utils/asyncHandler';

export const recipesController = {
  getByProduct: asyncHandler(async (req, res) => {
    const recipe = await recipesService.getByProduct(req.params.productId);
    res.json(recipe);
  }),

  create: asyncHandler(async (req, res) => {
    const recipe = await recipesService.replace(req.params.productId, req.body.items);
    res.status(201).json(recipe);
  }),

  update: asyncHandler(async (req, res) => {
    const recipe = await recipesService.replace(req.params.productId, req.body.items);
    res.json(recipe);
  }),

  removeItem: asyncHandler(async (req, res) => {
    await recipesService.deleteItem(req.params.productId, req.params.recipeItemId);
    res.status(204).send();
  })
};
