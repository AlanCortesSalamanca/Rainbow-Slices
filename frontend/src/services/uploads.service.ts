import { apiClient } from './apiClient';

interface ProductImageUploadResult {
  imageUrl: string;
  path: string;
  bucket: string;
}

export const uploadsService = {
  productImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.postForm<ProductImageUploadResult>('/uploads/product-image', formData);
  }
};
