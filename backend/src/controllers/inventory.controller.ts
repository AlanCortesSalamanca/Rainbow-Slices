import { inventoryService } from '../services/inventory.service';
import { asyncHandler } from '../utils/asyncHandler';

export const inventoryController = {
  finishedStock: asyncHandler(async (req, res) => {
    const stock = await inventoryService.finishedStock(req.query);
    res.json(stock);
  }),

  finishedProductDetail: asyncHandler(async (req, res) => {
    const detail = await inventoryService.finishedProductDetail(req.params.productId);
    res.json(detail);
  }),

  finishedProductMovements: asyncHandler(async (req, res) => {
    const movements = await inventoryService.finishedProductMovements(req.params.productId, req.query);
    res.json(movements);
  }),

  ingredientStock: asyncHandler(async (_req, res) => {
    const stock = await inventoryService.ingredientStock();
    res.json(stock);
  }),

  adjustment: asyncHandler(async (req, res) => {
    const result = await inventoryService.createAdjustment(req.body);
    res.status(201).json(result);
  }),

  waste: asyncHandler(async (req, res) => {
    const result = await inventoryService.createWaste(req.body);
    res.status(201).json(result);
  })
};
