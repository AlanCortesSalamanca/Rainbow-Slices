import { z } from 'zod';

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'in_preparation', 'ready', 'delivered', 'cancelled']);

const orderItemSchema = z.object({
  product_id: z.string().uuid().optional(),
  product_name: z.string().min(2),
  presentation: z.enum(['slice', 'whole', 'mini', 'custom']),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  is_custom_price: z.boolean().default(false),
  requires_production: z.boolean().default(false),
  notes: z.string().optional()
});

export const orderCreateSchema = z.object({
  customer_id: z.string().uuid().optional(),
  customer_name: z.string().min(2),
  customer_phone: z.string().min(8),
  delivery_date: z.string().min(10),
  delivery_time: z.enum(['11:00', '16:00']),
  delivery_point_id: z.string().uuid(),
  delivery_fee: z.number().nonnegative().default(15),
  deposit_paid: z.number().nonnegative().default(0),
  requires_production: z.boolean().default(false),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1)
});

export const orderUpdateSchema = orderCreateSchema.partial().extend({
  items: z.array(orderItemSchema).optional()
});

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
  deposit_paid: z.number().nonnegative().optional()
});

export const orderCancelSchema = z.object({
  notes: z.string().optional()
});
