import { inventoryService } from '../services/inventory.service';
import { asyncHandler } from '../utils/asyncHandler';

export const inventoryController = {
  finishedStock: asyncHandler(async (_req, res) => {
    const stock = await inventoryService.finishedStock();
    res.json(stock);
  }),

  ingredientStock: asyncHandler(async (_req, res) => {
    const stock = await inventoryService.ingredientStock();
    res.json(stock);
  }),

  adjustment: asyncHandler(async (req, res) => {
    const movement = await inventoryService.createAdjustment(req.body);
    res.status(201).json(movement);
  }),

  waste: asyncHandler(async (req, res) => {
    const movement = await inventoryService.createWaste(req.body);
    res.status(201).json(movement);
  })
};
