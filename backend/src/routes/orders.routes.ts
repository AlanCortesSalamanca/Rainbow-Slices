import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller';
import { uuidParamSchema } from '../schemas/common.schemas';
import { orderCancelSchema, orderCreateSchema, orderListQuerySchema, orderStatusUpdateSchema, orderUpdateSchema } from '../schemas/orders.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const ordersRouter = Router();

ordersRouter.get('/', validateRequest({ query: orderListQuerySchema }), ordersController.list);
ordersRouter.get('/:id', validateRequest({ params: uuidParamSchema }), ordersController.getById);
ordersRouter.post('/', validateRequest({ body: orderCreateSchema }), ordersController.create);
ordersRouter.put('/:id', validateRequest({ params: uuidParamSchema, body: orderUpdateSchema }), ordersController.update);
ordersRouter.patch('/:id/status', validateRequest({ params: uuidParamSchema, body: orderStatusUpdateSchema }), ordersController.updateStatus);
ordersRouter.post('/:id/deliver', validateRequest({ params: uuidParamSchema }), ordersController.deliver);
ordersRouter.post('/:id/cancel', validateRequest({ params: uuidParamSchema, body: orderCancelSchema }), ordersController.cancel);
