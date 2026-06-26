import { productsService } from '../services/products.service';
import { asyncHandler } from '../utils/asyncHandler';

export const productsController = {
  list: asyncHandler(async (req, res) => {
    const products = await productsService.list(req.query);
    res.json(products);
  }),

  getById: asyncHandler(async (req, res) => {
    const product = await productsService.getById(req.params.id);
    res.json(product);
  }),

  create: asyncHandler(async (req, res) => {
    const product = await productsService.create(req.body);
    res.status(201).json(product);
  }),

  update: asyncHandler(async (req, res) => {
    const product = await productsService.update(req.params.id, req.body);
    res.json(product);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const product = await productsService.updateStatus(req.params.id, req.body.status);
    res.json(product);
  }),

  remove: asyncHandler(async (req, res) => {
    const product = await productsService.deactivate(req.params.id);
    res.json(product);
  })
};
