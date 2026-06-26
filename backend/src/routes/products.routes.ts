import { Router } from 'express';
import { productsController } from '../controllers/products.controller';
import { uuidParamSchema } from '../schemas/common.schemas';
import { productCreateSchema, productListQuerySchema, productStatusUpdateSchema, productUpdateSchema } from '../schemas/products.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const productsRouter = Router();

productsRouter.get('/', validateRequest({ query: productListQuerySchema }), productsController.list);
productsRouter.get('/:id', validateRequest({ params: uuidParamSchema }), productsController.getById);
productsRouter.post('/', validateRequest({ body: productCreateSchema }), productsController.create);
productsRouter.put('/:id', validateRequest({ params: uuidParamSchema, body: productUpdateSchema }), productsController.update);
productsRouter.patch('/:id/status', validateRequest({ params: uuidParamSchema, body: productStatusUpdateSchema }), productsController.updateStatus);
productsRouter.delete('/:id', validateRequest({ params: uuidParamSchema }), productsController.remove);
