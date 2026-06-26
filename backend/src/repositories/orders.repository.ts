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

  async markDelivered(orderId: string) {
    const { error } = await supabase.rpc('mark_order_delivered', { p_order_id: orderId });
    if (error) throw new ApiError(400, error.message, error);
  }
}

export const ordersRepository = new OrdersRepository();
