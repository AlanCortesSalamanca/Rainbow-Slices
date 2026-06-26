import { z } from 'zod';

const movementTypes = ['production_output', 'reserved', 'unreserved', 'sold', 'waste', 'adjustment'] as const;

export const finishedProductParamsSchema = z.object({
  productId: z.string().uuid()
});

export const finishedInventoryQuerySchema = z.object({
  search: z.string().optional(),
  presentation: z.enum(['slice', 'whole', 'mini', 'custom']).optional(),
  status: z.enum(['with_stock', 'out_of_stock', 'negative']).optional(),
  sort: z.enum(['stock_asc', 'stock_desc', 'name']).optional()
});

export const finishedMovementsQuerySchema = z.object({
  movement_type: z.enum(movementTypes).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  related_order_id: z.string().uuid().optional(),
  related_production_batch_id: z.string().uuid().optional()
});

export const finishedAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().refine((value) => value !== 0, 'Quantity cannot be zero'),
  notes: z.string().trim().min(1, 'Las notas son obligatorias para ajustes manuales')
});

export const finishedWasteSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional()
});
