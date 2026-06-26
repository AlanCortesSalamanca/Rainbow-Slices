import { generalWhatsAppLink } from '../../utils/whatsapp';
import './PublicHeader.css';

export function PublicHeader() {
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
        <a className="public-header__whatsapp" href={generalWhatsAppLink} target="_blank" rel="noreferrer">Pedir por WhatsApp</a>
      </nav>
    </header>
  );
}
