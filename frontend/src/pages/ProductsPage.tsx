import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { StatusBadge } from '../components/StatusBadge';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product.types';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productsService
      .list()
      .then(setProducts)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle
        title="Productos"
        description="Catálogo interno de cheesecakes, presentaciones, precios y disponibilidad estimada."
        actions={<Link to="/products/new"><Button>Nuevo producto</Button></Link>}
      />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && products.length === 0 ? <EmptyState title="Sin productos" description="Agrega los cheesecakes iniciales desde el formulario o ejecuta los seeds." /> : null}
      {!loading && !error && products.length > 0 ? (
        <DataTable
          data={products}
          columns={[
            { key: 'name', header: 'Producto', render: (row) => <Link to={`/products/${row.id}`}>{row.name}</Link> },
            { key: 'presentation', header: 'Presentación', render: (row) => row.presentation },
            { key: 'pieces', header: 'Piezas/batch', render: (row) => row.pieces_per_batch },
            { key: 'price', header: 'Precio', render: (row) => <MoneyText value={Number(row.sale_price)} /> },
            { key: 'status', header: 'Estado', render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
      ) : null}
    </section>
  );
}
