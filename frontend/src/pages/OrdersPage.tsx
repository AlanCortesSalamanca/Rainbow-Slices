import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { SelectInput } from '../components/SelectInput';
import { StatusBadge } from '../components/StatusBadge';
import { TextInput } from '../components/TextInput';
import { deliveryPointsService } from '../services/deliveryPoints.service';
import { ordersService } from '../services/orders.service';
import type { DeliveryPoint } from '../types/delivery.types';
import type { Order } from '../types/order.types';
import type { OrderStatus, PaymentStatus } from '../types/common.types';
import './OrdersPage.css';

interface PendingAction {
  type: 'cancel' | 'deliver';
  order: Order;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryPointId, setDeliveryPointId] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadOrders() {
    const [nextOrders, nextDeliveryPoints] = await Promise.all([
      ordersService.list({ search, status, payment_status: paymentStatus, delivery_date: deliveryDate, delivery_point_id: deliveryPointId }),
      deliveryPointsService.list()
    ]);

    setOrders(nextOrders);
    setDeliveryPoints(nextDeliveryPoints);
  }

  useEffect(() => {
    loadOrders()
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function applyFilters() {
    setLoading(true);
    setError('');
    loadOrders()
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }

  async function updateStatus(order: Order, nextStatus: OrderStatus) {
    setBusy(true);
    setError('');
    try {
      await ordersService.updateStatus(order.id, { status: nextStatus });
      await loadOrders();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cambiar el estado');
    } finally {
      setBusy(false);
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;

    setBusy(true);
    setError('');

    try {
      if (pendingAction.type === 'cancel') {
        await ordersService.cancel(pendingAction.order.id, 'Cancelado desde lista de pedidos');
      } else {
        await ordersService.deliver(pendingAction.order.id);
      }
      setPendingAction(null);
      await loadOrders();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo completar la acción');
    } finally {
      setBusy(false);
    }
  }

  function renderQuickAction(order: Order) {
    if (order.status === 'pending') return <Button type="button" variant="secondary" disabled={busy} onClick={() => updateStatus(order, 'confirmed')}>Confirmar</Button>;
    if (order.status === 'confirmed') return <Button type="button" variant="secondary" disabled={busy} onClick={() => updateStatus(order, 'in_preparation')}>Preparar</Button>;
    if (order.status === 'in_preparation') return <Button type="button" variant="secondary" disabled={busy} onClick={() => updateStatus(order, 'ready')}>Listo</Button>;
    if (order.status === 'ready') return <Button type="button" variant="secondary" disabled={busy} onClick={() => setPendingAction({ type: 'deliver', order })}>Entregar</Button>;
    return null;
  }

  return (
    <section>
      <PageTitle title="Pedidos" description="Pedidos privados, anticipos, preparación, entrega y pago." actions={<Link to="/orders/new"><Button>Nuevo pedido</Button></Link>} />
      <div className="orders-page__filters panel">
        <FormField label="Buscar"><TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cliente o teléfono" /></FormField>
        <FormField label="Estado">
          <SelectInput value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | '')}>
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_preparation">En preparación</option>
            <option value="ready">Listo</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </SelectInput>
        </FormField>
        <FormField label="Pago">
          <SelectInput value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus | '')}>
            <option value="">Todos</option>
            <option value="unpaid">Sin pagar</option>
            <option value="deposit_paid">Anticipo</option>
            <option value="paid">Pagado</option>
            <option value="refunded">Reembolsado</option>
            <option value="cancelled_no_refund">Sin devolución</option>
          </SelectInput>
        </FormField>
        <FormField label="Fecha entrega"><TextInput type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></FormField>
        <FormField label="Punto">
          <SelectInput value={deliveryPointId} onChange={(event) => setDeliveryPointId(event.target.value)}>
            <option value="">Todos</option>
            {deliveryPoints.map((point) => <option key={point.id} value={point.id}>{point.name}</option>)}
          </SelectInput>
        </FormField>
        <Button type="button" onClick={applyFilters}>Aplicar filtros</Button>
      </div>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && orders.length === 0 ? <EmptyState title="Sin pedidos" description="No hay pedidos con los filtros actuales." /> : null}
      {!loading && !error && orders.length > 0 ? (
        <DataTable
          data={orders}
          columns={[
            { key: 'folio', header: 'Folio', render: (row) => <Link to={`/orders/${row.id}`}>#{row.id.slice(0, 8)}</Link> },
            { key: 'customer', header: 'Cliente', render: (row) => row.customer_name },
            { key: 'phone', header: 'Teléfono', render: (row) => row.customer_phone },
            { key: 'delivery', header: 'Entrega', render: (row) => `${row.delivery_date} ${row.delivery_time}` },
            { key: 'point', header: 'Punto', render: (row) => row.delivery_points?.name ?? 'Sin punto' },
            { key: 'total', header: 'Total', render: (row) => <MoneyText value={Number(row.total)} /> },
            { key: 'deposit', header: 'Anticipo', render: (row) => <MoneyText value={Number(row.deposit_paid)} /> },
            { key: 'balance', header: 'Saldo', render: (row) => <MoneyText value={Number(row.balance_due)} /> },
            { key: 'status', header: 'Estado', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'payment', header: 'Pago', render: (row) => <StatusBadge value={row.payment_status} /> },
            {
              key: 'actions',
              header: 'Acciones',
              render: (row) => (
                <div className="orders-page__actions">
                  <Link to={`/orders/${row.id}`}><Button type="button" variant="secondary">Ver</Button></Link>
                  {renderQuickAction(row)}
                  {!['delivered', 'cancelled'].includes(row.status) ? <Button type="button" variant="danger" disabled={busy} onClick={() => setPendingAction({ type: 'cancel', order: row })}>Cancelar</Button> : null}
                </div>
              )
            }
          ]}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === 'deliver' ? 'Marcar pedido entregado' : 'Cancelar pedido'}
        message={pendingAction?.type === 'deliver' ? 'Se registrará la venta, el ingreso y el pago del pedido.' : 'Se liberará el stock reservado y el pedido quedará cancelado.'}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </section>
  );
}
