import { apiClient } from './apiClient';
import type { IngredientStock } from '../types/ingredient.types';
import type {
  AdjustmentPayload,
  FinishedInventoryFilters,
  FinishedInventoryMovement,
  FinishedInventoryMovementFilters,
  FinishedInventoryMutationResult,
  FinishedInventoryProductDetail,
  FinishedInventoryStock,
  WastePayload
} from '../types/inventory.types';

function withQuery(path: string, params: object) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const inventoryService = {
  getFinishedInventory: (filters: FinishedInventoryFilters = {}) => apiClient.get<FinishedInventoryStock[]>(withQuery('/inventory/finished', filters)),
  getFinishedInventoryProduct: (productId: string) => apiClient.get<FinishedInventoryProductDetail>(`/inventory/finished/${productId}`),
  getFinishedInventoryMovements: (productId: string, filters: FinishedInventoryMovementFilters = {}) => (
    apiClient.get<FinishedInventoryMovement[]>(withQuery(`/inventory/finished/${productId}/movements`, filters))
  ),
  ingredients: () => apiClient.get<IngredientStock[]>('/inventory/ingredients'),
  createAdjustmentMovement: (payload: AdjustmentPayload) => apiClient.post<FinishedInventoryMutationResult>('/inventory/finished/adjustment', payload),
  createWasteMovement: (payload: WastePayload) => apiClient.post<FinishedInventoryMutationResult>('/inventory/finished/waste', payload)
};
