import { apiClient } from './apiClient';
import type { ProductionBatch } from '../types/production.types';

export const productionService = {
  list: () => apiClient.get<ProductionBatch[]>('/production'),
  create: (payload: { product_id: string; batches_quantity: number; notes?: string }) => apiClient.post<{ id: string }>('/production', payload)
};
