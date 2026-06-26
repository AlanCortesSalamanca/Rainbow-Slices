import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { BaseRepository } from './BaseRepository';

export class OrdersRepository extends BaseRepository {
  constructor() {
    super('orders');
  }

  async listWithDeliveryPoint() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, delivery_points(name)')
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async findWithItems(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, delivery_points(*), order_items(*)')
      .eq('id', id)
      .single();

    if (error) throw new ApiError(404, error.message, error);
    return data;
  }

  async createItems(items: Array<Record<string, unknown>>) {
    const { error } = await supabase.from('order_items').insert(items);
    if (error) throw new ApiError(400, error.message, error);
  }

  async createWithReservations(payload: {
    customer_id?: string | null;
    customer_name: string;
    customer_phone: string;
    delivery_date: string;
    delivery_time: string;
    delivery_point_id: string;
    delivery_fee: number;
    deposit_paid: number;
    notes?: string | null;
    items: Array<Record<string, unknown>>;
  }) {
    const { data, error } = await supabase.rpc('create_order_with_reservations', {
      p_customer_id: payload.customer_id ?? null,
      p_customer_name: payload.customer_name,
      p_customer_phone: payload.customer_phone,
      p_delivery_date: payload.delivery_date,
      p_delivery_time: payload.delivery_time,
      p_delivery_point_id: payload.delivery_point_id,
      p_delivery_fee: payload.delivery_fee,
      p_deposit_paid: payload.deposit_paid,
      p_notes: payload.notes ?? null,
      p_items: payload.items
    });

    if (error) throw new ApiError(400, error.message, error);
    return data as string;
  }

  async markDelivered(orderId: string) {
    const { error } = await supabase.rpc('mark_order_delivered', { p_order_id: orderId });
    if (error) throw new ApiError(400, error.message, error);
  }

  async cancelWithStockRelease(orderId: string, notes?: string) {
    const { error } = await supabase.rpc('cancel_order_with_stock_release', {
      p_order_id: orderId,
      p_notes: notes ?? null
    });

    if (error) throw new ApiError(400, error.message, error);
  }
}

export const ordersRepository = new OrdersRepository();
