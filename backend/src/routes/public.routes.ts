import { Router } from 'express';
import { publicController } from '../controllers/public.controller';

export const publicRouter = Router();

publicRouter.get('/products', publicController.products);
