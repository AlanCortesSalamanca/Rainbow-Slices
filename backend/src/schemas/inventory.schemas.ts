import { z } from 'zod';

export const finishedAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().refine((value) => value !== 0, 'Quantity cannot be zero'),
  notes: z.string().optional()
});

export const finishedWasteSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional()
});
