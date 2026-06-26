import type { Order } from '../types/order.types';
import './OrderCards.css';

interface CustomerInfoCardProps {
  order: Order;
}

export function CustomerInfoCard({ order }: CustomerInfoCardProps) {
  return (
    <section className="order-card">
      <h3>Cliente</h3>
      <dl className="order-card__grid">
        <div><dt>Nombre</dt><dd>{order.customer_name}</dd></div>
        <div><dt>Teléfono</dt><dd>{order.customer_phone}</dd></div>
        {order.notes ? <div className="order-card__wide"><dt>Notas</dt><dd>{order.notes}</dd></div> : null}
      </dl>
    </section>
  );
}
