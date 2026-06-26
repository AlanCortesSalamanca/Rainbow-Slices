import { apiClient } from './apiClient';
import type { Product, ProductDetailResponse } from '../types/product.types';

export const productsService = {
  list: () => apiClient.get<Product[]>('/products'),
  getById: (id: string) => apiClient.get<ProductDetailResponse>(`/products/${id}`),
  create: (payload: Partial<Product>) => apiClient.post<Product>('/products', payload),
  update: (id: string, payload: Partial<Product>) => apiClient.put<Product>(`/products/${id}`, payload),
  updateStatus: (id: string, status: Product['status']) => apiClient.patch<Product>(`/products/${id}/status`, { status }),
  remove: (id: string) => apiClient.delete<Product>(`/products/${id}`)
};
