import { z } from 'zod';

export const productionCreateSchema = z.object({
  product_id: z.string().uuid(),
  batches_quantity: z.number().int().positive().default(1),
  notes: z.string().optional()
});
