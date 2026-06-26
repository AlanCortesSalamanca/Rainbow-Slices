import { DataTable } from './DataTable';
import { MoneyText } from './MoneyText';
import type { OrderItem } from '../types/order.types';

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <DataTable
      data={items}
      columns={[
        { key: 'product', header: 'Producto', render: (row) => row.product_name },
        { key: 'presentation', header: 'Presentación', render: (row) => row.presentation },
        { key: 'quantity', header: 'Cantidad', render: (row) => row.quantity },
        { key: 'unit_price', header: 'Precio unitario', render: (row) => <MoneyText value={Number(row.unit_price)} /> },
        { key: 'total', header: 'Total línea', render: (row) => <MoneyText value={Number(row.line_total)} /> }
      ]}
    />
  );
}
