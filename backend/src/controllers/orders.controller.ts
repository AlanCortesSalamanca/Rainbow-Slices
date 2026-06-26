import { ordersService } from '../services/orders.service';
import { asyncHandler } from '../utils/asyncHandler';

export const ordersController = {
  list: asyncHandler(async (_req, res) => {
    const orders = await ordersService.list();
    res.json(orders);
  }),

  getById: asyncHandler(async (req, res) => {
    const order = await ordersService.getById(req.params.id);
    res.json(order);
  }),

  create: asyncHandler(async (req, res) => {
    const order = await ordersService.create(req.body);
    res.status(201).json(order);
  }),

  update: asyncHandler(async (req, res) => {
    const order = await ordersService.update(req.params.id, req.body);
    res.json(order);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const order = await ordersService.updateStatus(req.params.id, req.body.status, req.body.deposit_paid);
    res.json(order);
  }),

  deliver: asyncHandler(async (req, res) => {
    const order = await ordersService.deliver(req.params.id);
    res.json(order);
  }),

  cancel: asyncHandler(async (req, res) => {
    const order = await ordersService.cancel(req.params.id, req.body.notes);
    res.json(order);
  })
};
