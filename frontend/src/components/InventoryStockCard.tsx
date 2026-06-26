import { Link } from 'react-router-dom';
import { Button } from './Button';
import { MoneyText } from './MoneyText';
import type { FinishedInventoryItem } from '../types/inventory.types';
import './InventoryStockCard.css';

const presentationLabels = {
  slice: 'Rebanada',
  whole: 'Entero',
  mini: 'Mini',
  custom: 'Personalizado'
};

const statusLabels = {
  available: 'Disponible',
  out_of_stock: 'Agotado',
  negative: 'Revisar'
};

interface InventoryStockCardProps {
  item: FinishedInventoryItem;
  onWaste: (item: FinishedInventoryItem) => void;
  onAdjustment: (item: FinishedInventoryItem) => void;
}

export function InventoryStockCard({ item, onWaste, onAdjustment }: InventoryStockCardProps) {
  return (
    <article className={`inventory-stock-card inventory-stock-card--${item.status}`}>
      <div className="inventory-stock-card__media">
        {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span>RS</span>}
      </div>
      <div className="inventory-stock-card__content">
        <div className="inventory-stock-card__heading">
          <div>
            <h3>{item.name}</h3>
            <p>{presentationLabels[item.presentation]} · <MoneyText value={item.sale_price} /></p>
          </div>
          <span className={`inventory-stock-card__status inventory-stock-card__status--${item.status}`}>{statusLabels[item.status]}</span>
        </div>
        <div className="inventory-stock-card__metrics">
          <div>
            <span>Stock actual</span>
            <strong>{item.current_stock}</strong>
          </div>
          <div>
            <span>Unidades por producción</span>
            <strong>{item.pieces_per_batch}</strong>
          </div>
        </div>
        {item.product_status === 'inactive' ? <p className="inventory-stock-card__warning">Producto inactivo: disponible solo para consulta de trazabilidad.</p> : null}
        {item.status === 'negative' ? <p className="inventory-stock-card__warning">Stock negativo: revisar movimientos.</p> : null}
        <div className="inventory-stock-card__actions">
          <Link className="inventory-stock-card__link" to={`/inventory/finished/${item.product_id}`}>Ver movimientos</Link>
          <Button variant="secondary" onClick={() => onWaste(item)} disabled={item.current_stock <= 0 || item.product_status !== 'active'}>Registrar merma</Button>
          <Button variant="secondary" onClick={() => onAdjustment(item)} disabled={item.product_status !== 'active'}>Ajuste manual</Button>
          <Link className="inventory-stock-card__link" to="/production">Ir a producción</Link>
        </div>
      </div>
    </article>
  );
}
