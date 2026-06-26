import { MoneyText } from './MoneyText';
import type { Order } from '../types/order.types';
import './OrderCards.css';

interface DeliveryInfoCardProps {
  order: Order;
}

export function DeliveryInfoCard({ order }: DeliveryInfoCardProps) {
  return (
    <section className="order-card">
      <h3>Entrega</h3>
      <dl className="order-card__grid">
        <div><dt>Fecha</dt><dd>{order.delivery_date}</dd></div>
        <div><dt>Horario</dt><dd>{order.delivery_time === '11:00' ? '11:00 AM' : '4:00 PM'}</dd></div>
        <div><dt>Punto</dt><dd>{order.delivery_points?.name ?? 'Sin punto'}</dd></div>
        <div><dt>Costo</dt><dd><MoneyText value={Number(order.delivery_fee)} /></dd></div>
      </dl>
    </section>
  );
}
