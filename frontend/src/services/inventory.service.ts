import { apiClient } from './apiClient';
import type { IngredientStock } from '../types/ingredient.types';
import type { FinishedInventoryStock } from '../types/inventory.types';

export const inventoryService = {
  finished: () => apiClient.get<FinishedInventoryStock[]>('/inventory/finished'),
  ingredients: () => apiClient.get<IngredientStock[]>('/inventory/ingredients'),
  adjustment: (payload: { product_id: string; quantity: number; notes?: string }) => apiClient.post('/inventory/finished/adjustment', payload),
  waste: (payload: { product_id: string; quantity: number; notes?: string }) => apiClient.post('/inventory/finished/waste', payload)
};
