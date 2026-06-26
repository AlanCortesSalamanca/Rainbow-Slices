import type { MovementType } from '../types/inventory.types';
import './InventoryMovementBadge.css';

const movementLabels: Record<MovementType, string> = {
  production_output: 'Producción',
  reserved: 'Reservado',
  unreserved: 'Liberado',
  sold: 'Vendido',
  waste: 'Merma',
  adjustment: 'Ajuste'
};

interface InventoryMovementBadgeProps {
  type: MovementType;
}

export function InventoryMovementBadge({ type }: InventoryMovementBadgeProps) {
  return <span className={`inventory-movement-badge inventory-movement-badge--${type.replace(/_/g, '-')}`}>{movementLabels[type]}</span>;
}
