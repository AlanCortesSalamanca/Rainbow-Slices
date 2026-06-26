export type PresentationType = 'slice' | 'whole' | 'mini' | 'custom';
export type ProductStatus = 'active' | 'inactive';
export type OrderStatus = 'pending' | 'confirmed' | 'in_preparation' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'cancelled_no_refund';

export interface ApiErrorResponse {
  message: string;
  details?: unknown;
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}
