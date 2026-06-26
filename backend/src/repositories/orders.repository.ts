import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { BaseRepository } from './BaseRepository';

export class OrdersRepository extends BaseRepository {
  constructor() {
    super('orders');
  }

  async listWithDeliveryPoint(filters: Record<string, unknown> = {}) {
    let query = supabase
      .from('orders')
      .select('*, delivery_points(id, name)');

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.payment_status) query = query.eq('payment_status', filters.payment_status);
    if (filters.delivery_date) query = query.eq('delivery_date', filters.delivery_date);
    if (filters.delivery_point_id) query = query.eq('delivery_point_id', filters.delivery_point_id);
    if (filters.search) {
      const search = String(filters.search).replace(/[%_,]/g, '');
      query = query.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

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
    const [movements, incomeRecords] = await Promise.all([
      this.listInventoryMovementsForOrder(id),
      this.listIncomeRecordsForOrder(id)
    ]);

    return { ...data, inventory_movements: movements, income_records: incomeRecords };
  }

  async listInventoryMovementsForOrder(orderId: string) {
    const { data, error } = await supabase
      .from('finished_inventory_movements')
      .select('*')
      .eq('related_order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new ApiError(500, error.message, error);
    return data;
  }

  async listIncomeRecordsForOrder(orderId: string) {
    const { data, error } = await supabase
      .from('income_records')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new ApiError(500, error.message, error);
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
