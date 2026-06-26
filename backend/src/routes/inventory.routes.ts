import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { finishedAdjustmentSchema, finishedWasteSchema } from '../schemas/inventory.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const inventoryRouter = Router();

inventoryRouter.get('/finished', inventoryController.finishedStock);
inventoryRouter.get('/ingredients', inventoryController.ingredientStock);
inventoryRouter.post('/finished/adjustment', validateRequest({ body: finishedAdjustmentSchema }), inventoryController.adjustment);
inventoryRouter.post('/finished/waste', validateRequest({ body: finishedWasteSchema }), inventoryController.waste);
