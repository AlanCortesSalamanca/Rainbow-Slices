import { reportsService } from '../services/reports.service';
import { asyncHandler } from '../utils/asyncHandler';

export const reportsController = {
  summary: asyncHandler(async (req, res) => {
    const report = await reportsService.summary(String(req.query.from ?? ''), String(req.query.to ?? ''));
    res.json(report);
  }),

  salesByProduct: asyncHandler(async (req, res) => {
    const report = await reportsService.salesByProduct(String(req.query.from ?? ''), String(req.query.to ?? ''));
    res.json(report);
  }),

  salesByDeliveryPoint: asyncHandler(async (req, res) => {
    const report = await reportsService.salesByDeliveryPoint(String(req.query.from ?? ''), String(req.query.to ?? ''));
    res.json(report);
  }),

  lowStock: asyncHandler(async (_req, res) => {
    const report = await reportsService.lowStock();
    res.json(report);
  }),

  waste: asyncHandler(async (req, res) => {
    const report = await reportsService.waste(String(req.query.from ?? ''), String(req.query.to ?? ''));
    res.json(report);
  })
};
