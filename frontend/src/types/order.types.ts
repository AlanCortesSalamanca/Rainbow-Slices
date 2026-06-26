import type { OrderStatus, PaymentStatus, PresentationType } from './common.types';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  presentation: PresentationType;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_custom_price: boolean;
  requires_production: boolean;
  notes?: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  delivery_time: '11:00' | '16:00';
  delivery_point_id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  deposit_required: boolean;
  suggested_deposit: number;
  deposit_paid: number;
  balance_due: number;
  requires_production: boolean;
  status: OrderStatus;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}
