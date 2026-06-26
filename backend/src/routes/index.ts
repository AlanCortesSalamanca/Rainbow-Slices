import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAdminAuth } from '../middlewares/auth.middleware';
import { authRouter } from './auth.routes';
import { deliveryPointsRouter } from './deliveryPoints.routes';
import { expensesRouter } from './expenses.routes';
import { ingredientsRouter } from './ingredients.routes';
import { inventoryRouter } from './inventory.routes';
import { ordersRouter } from './orders.routes';
import { productsRouter } from './products.routes';
import { productionRouter } from './production.routes';
import { publicRouter } from './public.routes';
import { recipesRouter } from './recipes.routes';
import { reportsRouter } from './reports.routes';
import { uploadsRouter } from './uploads.routes';

export const apiRouter = Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/public', publicLimiter, publicRouter);
apiRouter.use(requireAdminAuth);
apiRouter.use('/products', productsRouter);
apiRouter.use('/products', recipesRouter);
apiRouter.use('/ingredients', ingredientsRouter);
apiRouter.use('/production', productionRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/delivery-points', deliveryPointsRouter);
apiRouter.use('/expenses', expensesRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/uploads', uploadsRouter);
