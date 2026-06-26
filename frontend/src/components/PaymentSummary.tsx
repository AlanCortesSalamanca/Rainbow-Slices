import { MoneyText } from './MoneyText';
import type { Order } from '../types/order.types';
import './OrderCards.css';

interface PaymentSummaryProps {
  order: Order;
}

export function PaymentSummary({ order }: PaymentSummaryProps) {
  return (
    <section className="order-card">
      <h3>Pago</h3>
      <dl className="order-card__grid">
        <div><dt>Subtotal</dt><dd><MoneyText value={Number(order.subtotal)} /></dd></div>
        <div><dt>Entrega</dt><dd><MoneyText value={Number(order.delivery_fee)} /></dd></div>
        <div><dt>Total</dt><dd><MoneyText value={Number(order.total)} /></dd></div>
        <div><dt>Anticipo requerido</dt><dd>{order.deposit_required ? 'Sí' : 'No'}</dd></div>
        <div><dt>Anticipo sugerido</dt><dd><MoneyText value={Number(order.suggested_deposit)} /></dd></div>
        <div><dt>Anticipo pagado</dt><dd><MoneyText value={Number(order.deposit_paid)} /></dd></div>
        <div><dt>Saldo pendiente</dt><dd><MoneyText value={Number(order.balance_due)} /></dd></div>
      </dl>
    </section>
  );
}
