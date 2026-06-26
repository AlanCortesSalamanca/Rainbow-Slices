import { deliveryPointsRepository } from '../repositories/deliveryPoints.repository';

export class DeliveryPointsService {
  listActive() {
    return deliveryPointsRepository.listActive();
  }
}

export const deliveryPointsService = new DeliveryPointsService();
