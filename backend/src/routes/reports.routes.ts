import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { dateRangeQuerySchema } from '../schemas/common.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const reportsRouter = Router();

reportsRouter.get('/summary', validateRequest({ query: dateRangeQuerySchema }), reportsController.summary);
reportsRouter.get('/sales-by-product', validateRequest({ query: dateRangeQuerySchema }), reportsController.salesByProduct);
reportsRouter.get('/sales-by-delivery-point', validateRequest({ query: dateRangeQuerySchema }), reportsController.salesByDeliveryPoint);
reportsRouter.get('/stock-low', reportsController.lowStock);
reportsRouter.get('/waste', validateRequest({ query: dateRangeQuerySchema }), reportsController.waste);
