import { Router } from 'express';
import { productionController } from '../controllers/production.controller';
import { productionCreateSchema } from '../schemas/production.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const productionRouter = Router();

productionRouter.get('/', productionController.list);
productionRouter.post('/', validateRequest({ body: productionCreateSchema }), productionController.create);
