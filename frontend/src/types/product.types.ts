import type { PresentationType, ProductStatus } from './common.types';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  presentation: PresentationType;
  pieces_per_batch: number;
  sale_price: number;
  image_url?: string | null;
  preparation_time_days: number;
  status: ProductStatus;
  is_custom: boolean;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDetailResponse {
  product: Product;
  recipeCost?: {
    batch_cost: number;
    estimated_unit_cost: number;
    estimated_profit: number;
  } | null;
  availability?: {
    can_prepare_one_batch: boolean;
    max_batches_available: number;
  } | null;
}
