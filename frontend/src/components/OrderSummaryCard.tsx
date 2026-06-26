import { StatusBadge } from './StatusBadge';
import type { Order } from '../types/order.types';
import './OrderCards.css';

interface OrderSummaryCardProps {
  order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <section className="order-card order-card--hero">
      <div>
        <span className="order-card__eyebrow">Folio #{order.id.slice(0, 8)}</span>
        <h3>Pedido de {order.customer_name}</h3>
        <p>Creado el {new Date(order.created_at).toLocaleString('es-MX')}</p>
      </div>
      <div className="order-card__badges">
        <StatusBadge value={order.status} />
        <StatusBadge value={order.payment_status} />
      </div>
    </section>
  );
}
