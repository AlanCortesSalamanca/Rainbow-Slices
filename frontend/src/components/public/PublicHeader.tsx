import { generalWhatsAppLink } from '../../utils/whatsapp';
import { usePublicCart } from '../../features/publicCart/PublicCartContext';
import './PublicHeader.css';

export function PublicHeader() {
  const { isOpen, openCart, totalItems } = usePublicCart();

  return (
    <header className="public-header">
      <nav className="public-header__nav" aria-label="Navegación pública">
        <a className="public-header__brand" href="#inicio">
          <img src="/brand/rainbow-slices-logo.png" alt="Logo de Rainbow Slices" />
          <span>Rainbow Slices</span>
        </a>
        <div className="public-header__links">
          <a href="#inicio">Inicio</a>
          <a href="#sabores">Sabores</a>
          <a href="#como-pedir">Cómo pedir</a>
          <a href="#entregas">Entregas</a>
          <a href="#pedido">Pedir</a>
        </div>
        <div className="public-header__actions">
          <button type="button" className="public-header__cart" onClick={openCart} aria-expanded={isOpen} aria-controls="public-cart-drawer" aria-label={`Abrir mi pedido con ${totalItems} producto(s)`}>
            Mi pedido <span>{totalItems}</span>
          </button>
          <a className="public-header__whatsapp" href={generalWhatsAppLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </nav>
    </header>
  );
}
