import { apiClient } from './apiClient';
import type { Order } from '../types/order.types';

export const ordersService = {
  list: () => apiClient.get<Order[]>('/orders'),
  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`),
  create: (payload: unknown) => apiClient.post<Order>('/orders', payload),
  update: (id: string, payload: unknown) => apiClient.put<Order>(`/orders/${id}`, payload),
  updateStatus: (id: string, payload: { status: Order['status']; deposit_paid?: number }) => apiClient.patch<Order>(`/orders/${id}/status`, payload),
  deliver: (id: string) => apiClient.post<Order>(`/orders/${id}/deliver`, {}),
  cancel: (id: string, notes?: string) => apiClient.post<Order>(`/orders/${id}/cancel`, { notes })
};
