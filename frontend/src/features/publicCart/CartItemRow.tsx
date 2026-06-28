import type { PublicCartItem } from './publicCart.types';
import { formatCurrency, getCartItemLimit, presentationLabels } from './publicCart.utils';
import { usePublicCart } from './PublicCartContext';
import './CartItemRow.css';

interface CartItemRowProps {
  item: PublicCartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { incrementItem, decrementItem, removeItem } = usePublicCart();
  const hasKnownStock = item.current_stock > 0;
  const isAtStockLimit = hasKnownStock && item.quantity >= getCartItemLimit(item);
  const lineTotal = item.sale_price > 0 ? formatCurrency(item.sale_price * item.quantity) : 'Cotizar';

  return (
    <article className="cart-item-row">
      <div className="cart-item-row__image">
        {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span aria-hidden="true" />}
      </div>
      <div className="cart-item-row__content">
        <div className="cart-item-row__heading">
          <div>
            <h3>{item.name}</h3>
            <p>{presentationLabels[item.presentation]}</p>
          </div>
          <button type="button" onClick={() => removeItem(item.productId)} aria-label={`Eliminar ${item.name} del pedido`}>
            Eliminar
          </button>
        </div>
        <div className="cart-item-row__meta">
          <span>{item.sale_price > 0 ? `${formatCurrency(item.sale_price)} c/u` : 'Precio por confirmar'}</span>
          <strong>{lineTotal}</strong>
        </div>
        <div className="cart-item-row__controls">
          <button type="button" onClick={() => decrementItem(item.productId)} aria-label={`Disminuir cantidad de ${item.name}`}>
            -
          </button>
          <span aria-label={`Cantidad ${item.quantity}`}>{item.quantity}</span>
          <button type="button" onClick={() => incrementItem(item.productId)} disabled={isAtStockLimit} aria-label={`Incrementar cantidad de ${item.name}`}>
            +
          </button>
          <small>{hasKnownStock ? `${item.current_stock} disponibles` : 'Consultar disponibilidad'}</small>
        </div>
      </div>
    </article>
  );
}
