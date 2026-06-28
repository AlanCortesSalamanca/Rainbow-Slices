import { useEffect, useRef } from 'react';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';
import { CheckoutWhatsAppForm } from './CheckoutWhatsAppForm';
import { usePublicCart } from './PublicCartContext';
import './PublicCartDrawer.css';

export function PublicCartDrawer() {
  const { items, isOpen, totalItems, closeCart, clearCart } = usePublicCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeCart();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [closeCart, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="public-cart-drawer">
      <button type="button" className="public-cart-drawer__overlay" onClick={closeCart} aria-label="Cerrar pedido" />
      <aside ref={panelRef} id="public-cart-drawer" className="public-cart-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="public-cart-title">
        <header className="public-cart-drawer__header">
          <div>
            <p>Pedido por WhatsApp</p>
            <h2 id="public-cart-title">Mi pedido</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="public-cart-drawer__close" onClick={closeCart} aria-label="Cerrar carrito">
            ×
          </button>
        </header>

        <div className="public-cart-drawer__body">
          {items.length === 0 ? (
            <div className="public-cart-drawer__empty">
              <strong>Tu pedido está vacío</strong>
              <p>Agrega uno o varios sabores para armar tu resumen por WhatsApp.</p>
            </div>
          ) : (
            <>
              <div className="public-cart-drawer__items" aria-label="Productos en el pedido">
                {items.map((item) => <CartItemRow key={item.productId} item={item} />)}
              </div>
              <button type="button" className="public-cart-drawer__clear" onClick={clearCart}>Vaciar pedido</button>
            </>
          )}

          <CartSummary />

          <section className="public-cart-drawer__checkout">
            <div className="public-cart-drawer__checkout-heading">
              <span>{totalItems} producto(s)</span>
              <h3>Datos para confirmar</h3>
            </div>
            <CheckoutWhatsAppForm />
          </section>
        </div>
      </aside>
    </div>
  );
}
