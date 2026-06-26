import { Router } from 'express';
import { deliveryPointsController } from '../controllers/deliveryPoints.controller';

export const deliveryPointsRouter = Router();

deliveryPointsRouter.get('/', deliveryPointsController.list);
