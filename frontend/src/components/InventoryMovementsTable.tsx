import { Link } from 'react-router-dom';
import { DataTable } from './DataTable';
import { InventoryMovementBadge } from './InventoryMovementBadge';
import type { FinishedInventoryMovement } from '../types/inventory.types';
import './InventoryMovementsTable.css';

const formatDate = (value: string) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

function shortId(value: string | null) {
  return value ? value.slice(0, 8) : 'No aplica';
}

interface InventoryMovementsTableProps {
  movements: FinishedInventoryMovement[];
}

export function InventoryMovementsTable({ movements }: InventoryMovementsTableProps) {
  return (
    <DataTable
      data={movements}
      columns={[
        { key: 'created_at', header: 'Fecha', render: (row) => formatDate(row.created_at) },
        { key: 'movement_type', header: 'Tipo', render: (row) => <InventoryMovementBadge type={row.movement_type} /> },
        {
          key: 'quantity',
          header: 'Cantidad',
          render: (row) => <strong className={row.quantity > 0 ? 'inventory-movements-table__positive' : 'inventory-movements-table__negative'}>{row.quantity}</strong>
        },
        {
          key: 'order',
          header: 'Pedido',
          render: (row) => row.related_order_id ? <Link to={`/orders/${row.related_order_id}`}>{shortId(row.related_order_id)}</Link> : 'No aplica'
        },
        { key: 'production', header: 'Producción', render: (row) => shortId(row.production_batch_id) },
        { key: 'notes', header: 'Notas', render: (row) => row.notes || 'Sin notas' },
        { key: 'id', header: 'Movimiento', render: (row) => shortId(row.movement_id) }
      ]}
    />
  );
}
