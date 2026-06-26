import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { StatusBadge } from '../components/StatusBadge';
import { ordersService } from '../services/orders.service';
import type { Order } from '../types/order.types';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersService
      .list()
      .then(setOrders)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle title="Pedidos" description="Pedidos privados, anticipos, preparación, entrega y pago." actions={<Link to="/orders/new"><Button>Nuevo pedido</Button></Link>} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <DataTable
          data={orders}
          columns={[
            { key: 'customer', header: 'Cliente', render: (row) => <Link to={`/orders/${row.id}`}>{row.customer_name}</Link> },
            { key: 'delivery', header: 'Entrega', render: (row) => `${row.delivery_date} ${row.delivery_time}` },
            { key: 'total', header: 'Total', render: (row) => <MoneyText value={Number(row.total)} /> },
            { key: 'status', header: 'Estado', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'payment', header: 'Pago', render: (row) => <StatusBadge value={row.payment_status} /> }
          ]}
        />
      ) : null}
    </section>
  );
}
