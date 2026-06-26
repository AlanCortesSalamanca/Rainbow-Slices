import { Router } from 'express';
import { expensesController } from '../controllers/expenses.controller';
import { expenseCreateSchema } from '../schemas/expenses.schemas';
import { validateRequest } from '../middlewares/validateRequest';

export const expensesRouter = Router();

expensesRouter.get('/', expensesController.list);
expensesRouter.post('/', validateRequest({ body: expenseCreateSchema }), expensesController.create);
