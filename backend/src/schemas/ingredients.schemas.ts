import { z } from 'zod';

export const ingredientCreateSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  minimum_stock: z.number().nonnegative().default(0),
  active: z.boolean().default(true)
});

export const ingredientUpdateSchema = ingredientCreateSchema.partial();

export const ingredientStatusUpdateSchema = z.object({
  active: z.boolean()
});

export const addIngredientStockSchema = z.object({
  quantity: z.number().positive(),
  total_cost: z.number().nonnegative(),
  notes: z.string().optional()
});
