import { z } from 'zod';

export const recipeItemsSchema = z.object({
  items: z.array(
    z.object({
      ingredient_id: z.string().uuid(),
      quantity_required: z.number().positive()
    })
  )
});
