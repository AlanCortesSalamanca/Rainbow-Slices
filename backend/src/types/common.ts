export type PresentationType = 'slice' | 'whole' | 'mini' | 'custom';
export type ProductStatus = 'active' | 'inactive';
export type OrderStatus = 'pending' | 'confirmed' | 'in_preparation' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'cancelled_no_refund';
export type ExpenseCategory = 'ingredients' | 'packaging' | 'transport' | 'advertising' | 'utensils' | 'services' | 'other';

export interface DateRangeQuery {
  from?: string;
  to?: string;
}
