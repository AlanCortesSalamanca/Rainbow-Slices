import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { StatusBadge } from '../components/StatusBadge';
import { ordersService } from '../services/orders.service';
import type { Order } from '../types/order.types';

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersService
      .getById(id)
      .then(setOrder)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!order) return null;

  return (
    <section>
      <PageTitle title={`Pedido de ${order.customer_name}`} description="Detalle de items, anticipo, saldo y estados." />
      <div className="panel form-grid">
        <p><strong>Estado:</strong> <StatusBadge value={order.status} /></p>
        <p><strong>Pago:</strong> <StatusBadge value={order.payment_status} /></p>
        <p><strong>Total:</strong> <MoneyText value={Number(order.total)} /></p>
        <p><strong>Saldo:</strong> <MoneyText value={Number(order.balance_due)} /></p>
      </div>
      <DataTable
        data={order.order_items ?? []}
        columns={[
          { key: 'product', header: 'Producto', render: (row) => row.product_name },
          { key: 'presentation', header: 'Presentación', render: (row) => row.presentation },
          { key: 'quantity', header: 'Cantidad', render: (row) => row.quantity },
          { key: 'total', header: 'Total', render: (row) => <MoneyText value={Number(row.line_total)} /> }
        ]}
      />
    </section>
  );
}
