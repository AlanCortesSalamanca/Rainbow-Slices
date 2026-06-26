import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import {
  finishedAdjustmentSchema,
  finishedInventoryQuerySchema,
  finishedMovementsQuerySchema,
  finishedProductParamsSchema,
  finishedWasteSchema
} from '../schemas/inventory.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const inventoryRouter = Router();

inventoryRouter.get('/finished', validateRequest({ query: finishedInventoryQuerySchema }), inventoryController.finishedStock);
inventoryRouter.get('/finished/:productId', validateRequest({ params: finishedProductParamsSchema }), inventoryController.finishedProductDetail);
inventoryRouter.get(
  '/finished/:productId/movements',
  validateRequest({ params: finishedProductParamsSchema, query: finishedMovementsQuerySchema }),
  inventoryController.finishedProductMovements
);
inventoryRouter.get('/ingredients', inventoryController.ingredientStock);
inventoryRouter.post('/finished/adjustment', validateRequest({ body: finishedAdjustmentSchema }), inventoryController.adjustment);
inventoryRouter.post('/finished/waste', validateRequest({ body: finishedWasteSchema }), inventoryController.waste);
