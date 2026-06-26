import { ordersRepository } from '../repositories/orders.repository';
import { ApiError } from '../utils/ApiError';

interface OrderItemPayload {
  product_id: string;
  product_name?: string;
  presentation?: string;
  quantity: number;
  unit_price: number;
  is_custom_price?: boolean;
  requires_production?: boolean;
  notes?: string;
}

interface OrderPayload {
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  delivery_time: string;
  delivery_point_id: string;
  delivery_fee?: number;
  deposit_paid?: number;
  requires_production?: boolean;
  notes?: string;
  items: OrderItemPayload[];
}

export class OrdersService {
  list() {
    return ordersRepository.listWithDeliveryPoint();
  }

  getById(id: string) {
    return ordersRepository.findWithItems(id);
  }

  async create(payload: OrderPayload) {
    const orderId = await ordersRepository.createWithReservations({
      customer_id: payload.customer_id ?? null,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      delivery_date: payload.delivery_date,
      delivery_time: payload.delivery_time,
      delivery_point_id: payload.delivery_point_id,
      delivery_fee: payload.delivery_fee ?? 15,
      deposit_paid: payload.deposit_paid ?? 0,
      notes: payload.notes ?? null,
      items: payload.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        is_custom_price: item.is_custom_price ?? false,
        notes: item.notes ?? null
      }))
    });

    return ordersRepository.findWithItems(orderId);
  }

  async update(id: string, payload: Partial<OrderPayload>) {
    const { items: _items, ...orderPayload } = payload;
    await ordersRepository.update(id, orderPayload as Record<string, unknown>);
    return ordersRepository.findWithItems(id);
  }

  async updateStatus(id: string, status: string, depositPaid?: number) {
    const order = await ordersRepository.findWithItems(id);

    if (status === 'confirmed' && Number(order.total) > 300 && Number(depositPaid ?? order.deposit_paid) <= 0) {
      throw new ApiError(400, 'Orders over $300 MXN require a deposit before confirmation');
    }

    return ordersRepository.update(id, {
      status,
      ...(depositPaid !== undefined ? { deposit_paid: depositPaid } : {})
    });
  }

  async deliver(id: string) {
    await ordersRepository.markDelivered(id);
    return ordersRepository.findWithItems(id);
  }

  async cancel(id: string, notes?: string) {
    await ordersRepository.cancelWithStockRelease(id, notes);
    return ordersRepository.findWithItems(id);
  }
}

export const ordersService = new OrdersService();
