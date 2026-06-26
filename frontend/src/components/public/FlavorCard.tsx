import type { PresentationType } from '../../types/common.types';
import type { PublicProduct } from '../../types/public.types';
import { createWhatsAppLink } from '../../utils/whatsapp';
import './FlavorCard.css';

const presentationLabels: Record<PresentationType, string> = {
  slice: 'Rebanada',
  whole: 'Completo',
  mini: 'Mini',
  custom: 'Personalizado'
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

interface FlavorCardProps {
  product: PublicProduct;
}

export function FlavorCard({ product }: FlavorCardProps) {
  const link = createWhatsAppLink(`Hola, quiero hacer un pedido de Rainbow Slices. Me interesa: ${product.name}. ¿Me puedes dar disponibilidad?`);
  const isAvailable = product.current_stock > 0;

  return (
    <article className="flavor-card">
      <div className="flavor-card__visual">
        {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span className="flavor-card__slice" aria-hidden="true" />}
      </div>
      <div className="flavor-card__body">
        <div className="flavor-card__meta">
          <span className="flavor-card__label">{presentationLabels[product.presentation] ?? 'Rebanada'}</span>
          <span className={isAvailable ? 'flavor-card__stock flavor-card__stock--available' : 'flavor-card__stock flavor-card__stock--consult'}>
            {isAvailable ? 'Disponible' : 'Consultar disponibilidad'}
          </span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description || 'Cheesecake artesanal preparado con textura cremosa y sabor premium.'}</p>
        {product.sale_price > 0 ? <strong className="flavor-card__price">{formatPrice(product.sale_price)}</strong> : null}
        <a href={link} target="_blank" rel="noreferrer" aria-label={`Pedir ${product.name} por WhatsApp`}>Pedir este sabor</a>
      </div>
    </article>
  );
}
