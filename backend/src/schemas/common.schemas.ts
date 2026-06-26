import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid()
});

export const productIdParamSchema = z.object({
  productId: z.string().uuid()
});

export const recipeItemParamSchema = z.object({
  productId: z.string().uuid(),
  recipeItemId: z.string().uuid()
});

export const dateRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional()
});
