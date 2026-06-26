import { z } from 'zod';

export const expenseCreateSchema = z.object({
  concept: z.string().min(2),
  category: z.enum(['packaging', 'transport', 'advertising', 'utensils', 'services', 'other']),
  amount: z.number().nonnegative(),
  expense_date: z.string().optional(),
  notes: z.string().optional()
});
