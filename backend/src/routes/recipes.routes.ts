import { Router } from 'express';
import { recipesController } from '../controllers/recipes.controller';
import { productIdParamSchema, recipeItemParamSchema } from '../schemas/common.schemas';
import { recipeItemsSchema } from '../schemas/recipes.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const recipesRouter = Router({ mergeParams: true });

recipesRouter.get('/:productId/recipe', validateRequest({ params: productIdParamSchema }), recipesController.getByProduct);
recipesRouter.post('/:productId/recipe', validateRequest({ params: productIdParamSchema, body: recipeItemsSchema }), recipesController.create);
recipesRouter.put('/:productId/recipe', validateRequest({ params: productIdParamSchema, body: recipeItemsSchema }), recipesController.update);
recipesRouter.delete('/:productId/recipe/:recipeItemId', validateRequest({ params: recipeItemParamSchema }), recipesController.removeItem);
