import { apiClient } from './apiClient';
import type { DeliveryPoint } from '../types/delivery.types';

export const deliveryPointsService = {
  list: () => apiClient.get<DeliveryPoint[]>('/delivery-points')
};
