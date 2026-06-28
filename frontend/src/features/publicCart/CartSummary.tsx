import { usePublicCart } from './PublicCartContext';
import { formatCurrency, getCartDeliveryFee, getCartSubtotal, getCartTotal } from './publicCart.utils';
import './CartSummary.css';

export function CartSummary() {
  const { items } = usePublicCart();
  const subtotal = getCartSubtotal(items);
  const fee = getCartDeliveryFee(items);
  const total = getCartTotal(items);

  return (
    <section className="cart-summary" aria-label="Resumen del pedido">
      <div>
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
      <div>
        <span>Entrega</span>
        <strong>{formatCurrency(fee)}</strong>
      </div>
      <div className="cart-summary__total">
        <span>Total estimado</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <p>El total final y la disponibilidad se confirman por WhatsApp.</p>
    </section>
  );
}
