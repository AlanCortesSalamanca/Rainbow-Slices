import { apiClient } from './apiClient';
import type { Order, OrderListFilters } from '../types/order.types';

function toQuery(filters: OrderListFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const ordersService = {
  list: (filters?: OrderListFilters) => apiClient.get<Order[]>(`/orders${toQuery(filters)}`),
  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`),
  create: (payload: unknown) => apiClient.post<Order>('/orders', payload),
  update: (id: string, payload: unknown) => apiClient.put<Order>(`/orders/${id}`, payload),
  updateStatus: (id: string, payload: { status: Order['status']; deposit_paid?: number }) => apiClient.patch<Order>(`/orders/${id}/status`, payload),
  deliver: (id: string) => apiClient.post<Order>(`/orders/${id}/deliver`, {}),
  cancel: (id: string, notes?: string) => apiClient.post<Order>(`/orders/${id}/cancel`, { notes })
};
