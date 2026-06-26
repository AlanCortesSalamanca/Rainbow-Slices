import { apiClient } from './apiClient';

export const uploadsService = {
  productImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.postForm<{ imageUrl: string }>('/uploads/product-image', formData);
  }
};
