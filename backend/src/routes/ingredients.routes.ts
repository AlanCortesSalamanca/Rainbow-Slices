import { Router } from 'express';
import { ingredientsController } from '../controllers/ingredients.controller';
import { uuidParamSchema } from '../schemas/common.schemas';
import { addIngredientStockSchema, ingredientCreateSchema, ingredientStatusUpdateSchema, ingredientUpdateSchema } from '../schemas/ingredients.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const ingredientsRouter = Router();

ingredientsRouter.get('/', ingredientsController.list);
ingredientsRouter.get('/:id', validateRequest({ params: uuidParamSchema }), ingredientsController.getById);
ingredientsRouter.post('/', validateRequest({ body: ingredientCreateSchema }), ingredientsController.create);
ingredientsRouter.put('/:id', validateRequest({ params: uuidParamSchema, body: ingredientUpdateSchema }), ingredientsController.update);
ingredientsRouter.patch('/:id/status', validateRequest({ params: uuidParamSchema, body: ingredientStatusUpdateSchema }), ingredientsController.updateStatus);
ingredientsRouter.post('/:id/stock', validateRequest({ params: uuidParamSchema, body: addIngredientStockSchema }), ingredientsController.addStock);
