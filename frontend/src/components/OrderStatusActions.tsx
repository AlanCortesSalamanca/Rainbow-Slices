import { Button } from './Button';
import type { Order } from '../types/order.types';
import './OrderStatusActions.css';

interface OrderStatusActionsProps {
  order: Order;
  busy: boolean;
  onStatusChange: (status: Order['status']) => void;
  onDeliver: () => void;
  onCancel: () => void;
}

export function OrderStatusActions({ order, busy, onStatusChange, onDeliver, onCancel }: OrderStatusActionsProps) {
  const disabled = busy || order.status === 'delivered' || order.status === 'cancelled';

  return (
    <section className="order-actions">
      <h3>Acciones</h3>
      <div className="order-actions__buttons">
        {order.status === 'pending' ? <Button type="button" disabled={disabled} onClick={() => onStatusChange('confirmed')}>Confirmar pedido</Button> : null}
        {order.status === 'confirmed' ? <Button type="button" disabled={disabled} onClick={() => onStatusChange('in_preparation')}>Marcar en preparación</Button> : null}
        {order.status === 'in_preparation' ? <Button type="button" disabled={disabled} onClick={() => onStatusChange('ready')}>Marcar listo</Button> : null}
        {order.status === 'ready' ? <Button type="button" disabled={disabled} onClick={onDeliver}>Marcar entregado</Button> : null}
        {!['delivered', 'cancelled'].includes(order.status) ? <Button type="button" variant="danger" disabled={busy} onClick={onCancel}>Cancelar pedido</Button> : null}
      </div>
    </section>
  );
}
