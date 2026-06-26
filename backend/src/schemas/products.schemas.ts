import { z } from 'zod';

export const presentationSchema = z.enum(['slice', 'whole', 'mini', 'custom']);
export const productStatusSchema = z.enum(['active', 'inactive']);

const productBaseSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  category: z.string().min(2),
  description: z.string().nullable().optional(),
  presentation: presentationSchema,
  pieces_per_batch: z.number().int().positive().optional(),
  sale_price: z.number().nonnegative(),
  image_url: z.string().url().nullable().optional(),
  preparation_time_days: z.number().int().nonnegative(),
  status: productStatusSchema,
  is_custom: z.boolean(),
  internal_notes: z.string().nullable().optional()
});

export const productCreateSchema = productBaseSchema.extend({
  category: z.string().min(2).default('Cheesecake'),
  presentation: presentationSchema.default('slice'),
  sale_price: z.number().nonnegative().default(0),
  preparation_time_days: z.number().int().nonnegative().default(1),
  status: productStatusSchema.default('active'),
  is_custom: z.boolean().default(false)
});

export const productUpdateSchema = productBaseSchema.partial();

export const productStatusUpdateSchema = z.object({
  status: productStatusSchema
});

export const productListQuerySchema = z.object({
  status: productStatusSchema.optional(),
  presentation: presentationSchema.optional()
});
