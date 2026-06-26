import { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageTitle } from '../components/PageTitle';
import { inventoryService } from '../services/inventory.service';
import type { FinishedInventoryStock } from '../types/inventory.types';

export function FinishedInventoryPage() {
  const [stock, setStock] = useState<FinishedInventoryStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryService
      .finished()
      .then(setStock)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle title="Inventario terminado" description="Stock actual calculado por movimientos de producción, reservas, ventas, mermas y ajustes." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <DataTable
          data={stock}
          columns={[
            { key: 'name', header: 'Producto', render: (row) => row.name },
            { key: 'presentation', header: 'Presentación', render: (row) => row.presentation },
            { key: 'stock', header: 'Stock actual', render: (row) => row.current_stock }
          ]}
        />
      ) : null}
    </section>
  );
}
