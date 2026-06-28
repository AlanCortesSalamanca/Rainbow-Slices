import type { PresentationType } from '../../types/common.types';

export interface PublicCartProduct {
  id: string;
  name: string;
  slug: string;
  sale_price: number;
  image_url: string | null;
  presentation: PresentationType;
  current_stock: number;
}

export interface PublicCartItem {
  productId: string;
  name: string;
  slug: string;
  sale_price: number;
  image_url: string | null;
  presentation: PresentationType;
  quantity: number;
  current_stock: number;
}

export interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  deliveryPoint: string;
  deliveryTime: string;
  notes: string;
}

export type AddToCartResult = 'added' | 'max-stock';
