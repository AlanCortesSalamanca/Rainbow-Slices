import { apiClient } from './apiClient';
import type { Ingredient } from '../types/ingredient.types';

export const ingredientsService = {
  list: () => apiClient.get<Ingredient[]>('/ingredients'),
  getById: (id: string) => apiClient.get<Ingredient>(`/ingredients/${id}`),
  create: (payload: Partial<Ingredient>) => apiClient.post<Ingredient>('/ingredients', payload),
  update: (id: string, payload: Partial<Ingredient>) => apiClient.put<Ingredient>(`/ingredients/${id}`, payload),
  updateStatus: (id: string, active: boolean) => apiClient.patch<Ingredient>(`/ingredients/${id}/status`, { active }),
  addStock: (id: string, payload: { quantity: number; total_cost: number; notes?: string }) => apiClient.post<Ingredient>(`/ingredients/${id}/stock`, payload)
};
