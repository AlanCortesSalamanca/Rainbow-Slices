import { publicService } from '../services/public.service';
import { asyncHandler } from '../utils/asyncHandler';

export const publicController = {
  products: asyncHandler(async (_req, res) => {
    const products = await publicService.listProducts();
    res.json(products);
  })
};
