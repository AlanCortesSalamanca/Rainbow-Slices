import { ordersRepository } from '../repositories/orders.repository';
import { ApiError } from '../utils/ApiError';

const activeOrderStatuses = ['pending', 'confirmed', 'in_preparation', 'ready'];

const allowedStatusTransitions: Record<string, string[]> = {
  pending: ['confirmed'],
  confirmed: ['in_preparation'],
  in_preparation: ['ready'],
  ready: [],
  delivered: [],
  cancelled: []
};

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
  async list(filters: Record<string, unknown>) {
    const orders = await ordersRepository.listWithDeliveryPoint(filters);

    return [...orders].sort((first, second) => {
      const firstActive = activeOrderStatuses.includes(String(first.status));
      const secondActive = activeOrderStatuses.includes(String(second.status));

      if (firstActive !== secondActive) return firstActive ? -1 : 1;

      const deliveryCompare = String(first.delivery_date).localeCompare(String(second.delivery_date));
      if (deliveryCompare !== 0) return deliveryCompare;

      return new Date(String(second.created_at)).getTime() - new Date(String(first.created_at)).getTime();
    });
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
    const order = await ordersRepository.findWithItems(id);

    if (['delivered', 'cancelled'].includes(String(order.status))) {
      throw new ApiError(400, 'No se puede editar un pedido entregado o cancelado');
    }

    const nextDeposit = payload.deposit_paid !== undefined ? Number(payload.deposit_paid) : Number(order.deposit_paid);
    const nextTotal = Number(order.total);
    const nextPaymentStatus = nextDeposit <= 0 ? 'unpaid' : nextDeposit >= nextTotal ? 'paid' : 'deposit_paid';
    const nextBalanceDue = Math.max(nextTotal - nextDeposit, 0);

    await ordersRepository.update(id, {
      ...payload,
      ...(payload.deposit_paid !== undefined ? { payment_status: nextPaymentStatus, balance_due: nextBalanceDue } : {})
    } as Record<string, unknown>);

    return ordersRepository.findWithItems(id);
  }

  async updateStatus(id: string, status: string, depositPaid?: number) {
    const order = await ordersRepository.findWithItems(id);

    if (['delivered', 'cancelled'].includes(String(order.status))) {
      throw new ApiError(400, 'No se puede cambiar el estado de un pedido entregado o cancelado');
    }

    if (status === 'delivered') {
      throw new ApiError(400, 'Usa la acción de entrega para marcar un pedido como entregado');
    }

    if (status === 'cancelled') {
      throw new ApiError(400, 'Usa la acción de cancelación para cancelar un pedido');
    }

    if (!allowedStatusTransitions[String(order.status)]?.includes(status)) {
      throw new ApiError(400, `Transición inválida de ${order.status} a ${status}`);
    }

    if (status === 'confirmed' && Number(order.total) > 300 && Number(depositPaid ?? order.deposit_paid) <= 0) {
      throw new ApiError(400, 'Los pedidos mayores a $300 MXN requieren anticipo antes de confirmar');
    }

    const nextDeposit = depositPaid !== undefined ? Number(depositPaid) : Number(order.deposit_paid);
    const nextPaymentStatus = nextDeposit <= 0 ? 'unpaid' : nextDeposit >= Number(order.total) ? 'paid' : 'deposit_paid';

    await ordersRepository.update(id, {
      status,
      ...(depositPaid !== undefined ? { deposit_paid: depositPaid, balance_due: Math.max(Number(order.total) - nextDeposit, 0) } : {}),
      payment_status: nextPaymentStatus
    });

    return ordersRepository.findWithItems(id);
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
