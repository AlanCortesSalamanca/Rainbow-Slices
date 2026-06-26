import { productionService } from '../services/production.service';
import { asyncHandler } from '../utils/asyncHandler';

export const productionController = {
  list: asyncHandler(async (_req, res) => {
    const batches = await productionService.list();
    res.json(batches);
  }),

  create: asyncHandler(async (req, res) => {
    const batchId = await productionService.register(req.body);
    res.status(201).json({ id: batchId });
  })
};
