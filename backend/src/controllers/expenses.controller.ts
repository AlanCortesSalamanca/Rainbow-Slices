import { expensesService } from '../services/expenses.service';
import { asyncHandler } from '../utils/asyncHandler';

export const expensesController = {
  list: asyncHandler(async (_req, res) => {
    const expenses = await expensesService.list();
    res.json(expenses);
  }),

  create: asyncHandler(async (req, res) => {
    const expense = await expensesService.create(req.body);
    res.status(201).json(expense);
  })
};
