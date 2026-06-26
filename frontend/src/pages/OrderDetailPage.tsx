import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomerInfoCard } from '../components/CustomerInfoCard';
import { DeliveryInfoCard } from '../components/DeliveryInfoCard';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { OrderItemsTable } from '../components/OrderItemsTable';
import { OrderStatusActions } from '../components/OrderStatusActions';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { PageTitle } from '../components/PageTitle';
import { PaymentSummary } from '../components/PaymentSummary';
import { ordersService } from '../services/orders.service';
import type { Order } from '../types/order.types';
import './OrderDetailPage.css';

type PendingAction = 'cancel' | 'deliver' | null;

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  async function loadOrder() {
    const nextOrder = await ordersService.getById(id);
    setOrder(nextOrder);
  }

  useEffect(() => {
    loadOrder()
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: Order['status']) {
    if (!order) return;
    setBusy(true);
    setError('');

    try {
      const updatedOrder = await ordersService.updateStatus(order.id, { status });
      setOrder(updatedOrder);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cambiar el estado');
    } finally {
      setBusy(false);
    }
  }

  async function confirmPendingAction() {
    if (!order || !pendingAction) return;

    setBusy(true);
    setError('');

    try {
      const updatedOrder = pendingAction === 'deliver'
        ? await ordersService.deliver(order.id)
        : await ordersService.cancel(order.id, 'Cancelado desde detalle de pedido');
      setOrder(updatedOrder);
      setPendingAction(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo completar la acción');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!order) return error ? <ErrorState message={error} /> : null;

  const requiresDepositAlert = order.deposit_required && Number(order.deposit_paid) <= 0 && order.status === 'pending';
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <section>
      <PageTitle title={`Pedido #${order.id.slice(0, 8)}`} description="Detalle operativo del pedido, pago, entrega y acciones permitidas." actions={<Link to="/orders"><Button type="button" variant="secondary">Volver a pedidos</Button></Link>} />
      {error ? <ErrorState message={error} /> : null}
      {requiresDepositAlert ? <div className="order-detail__alert">Este pedido requiere anticipo antes de confirmarse.</div> : null}
      {Number(order.balance_due) > 0 && !isCancelled ? <div className="order-detail__notice">Saldo pendiente: se debe cobrar al entregar.</div> : null}
      {isCancelled ? <div className="order-detail__cancelled">Pedido cancelado. El stock reservado ya fue liberado si aplicaba.</div> : null}
      {isDelivered ? <div className="order-detail__delivered">Pedido entregado y venta registrada.</div> : null}
      <div className="order-detail__grid">
        <div className="order-detail__full"><OrderSummaryCard order={order} /></div>
        <CustomerInfoCard order={order} />
        <DeliveryInfoCard order={order} />
        <PaymentSummary order={order} />
        <OrderStatusActions order={order} busy={busy} onStatusChange={handleStatusChange} onDeliver={() => setPendingAction('deliver')} onCancel={() => setPendingAction('cancel')} />
        <section className="order-detail__full order-detail__section">
          <h3>Productos</h3>
          <OrderItemsTable items={order.order_items ?? []} />
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction === 'deliver' ? 'Marcar pedido entregado' : 'Cancelar pedido'}
        message={pendingAction === 'deliver' ? 'Se liberará reserva, se registrará venta, ingreso y pago.' : 'Se liberará el stock reservado y el pedido quedará cancelado.'}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </section>
  );
}
