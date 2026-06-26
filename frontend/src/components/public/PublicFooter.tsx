import { Link } from 'react-router-dom';
import { generalWhatsAppLink } from '../../utils/whatsapp';
import './PublicFooter.css';

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__brand">
        <img src="/brand/rainbow-slices-logo.png" alt="Logo de Rainbow Slices" />
        <div>
          <strong>Rainbow Slices</strong>
          <p>Cheesecakes de sabores en Morelia, Michoacán.</p>
        </div>
      </div>
      <div className="public-footer__info">
        <a href={generalWhatsAppLink} target="_blank" rel="noreferrer">WhatsApp: 2761274898</a>
        <span>Centro de Morelia · Carrillo · CFE de Colonia Industrial</span>
        <Link to="/login">Admin</Link>
      </div>
    </footer>
  );
}
