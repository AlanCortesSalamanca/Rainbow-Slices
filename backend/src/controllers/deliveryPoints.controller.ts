import { deliveryPointsService } from '../services/deliveryPoints.service';
import { asyncHandler } from '../utils/asyncHandler';

export const deliveryPointsController = {
  list: asyncHandler(async (_req, res) => {
    const deliveryPoints = await deliveryPointsService.listActive();
    res.json(deliveryPoints);
  })
};
