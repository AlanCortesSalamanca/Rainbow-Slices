import { Router } from 'express';
import { expensesRouter } from './expenses.routes';
import { ingredientsRouter } from './ingredients.routes';
import { inventoryRouter } from './inventory.routes';
import { ordersRouter } from './orders.routes';
import { productsRouter } from './products.routes';
import { productionRouter } from './production.routes';
import { recipesRouter } from './recipes.routes';
import { reportsRouter } from './reports.routes';
import { uploadsRouter } from './uploads.routes';

export const apiRouter = Router();

apiRouter.use('/products', productsRouter);
apiRouter.use('/products', recipesRouter);
apiRouter.use('/ingredients', ingredientsRouter);
apiRouter.use('/production', productionRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/expenses', expensesRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/uploads', uploadsRouter);
