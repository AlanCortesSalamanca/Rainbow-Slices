import { ingredientsService } from '../services/ingredients.service';
import { asyncHandler } from '../utils/asyncHandler';

export const ingredientsController = {
  list: asyncHandler(async (_req, res) => {
    const ingredients = await ingredientsService.list();
    res.json(ingredients);
  }),

  getById: asyncHandler(async (req, res) => {
    const ingredient = await ingredientsService.getById(req.params.id);
    res.json(ingredient);
  }),

  create: asyncHandler(async (req, res) => {
    const ingredient = await ingredientsService.create(req.body);
    res.status(201).json(ingredient);
  }),

  update: asyncHandler(async (req, res) => {
    const ingredient = await ingredientsService.update(req.params.id, req.body);
    res.json(ingredient);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const ingredient = await ingredientsService.updateStatus(req.params.id, req.body.active);
    res.json(ingredient);
  }),

  addStock: asyncHandler(async (req, res) => {
    const ingredient = await ingredientsService.addStock(req.params.id, req.body);
    res.status(201).json(ingredient);
  })
};
