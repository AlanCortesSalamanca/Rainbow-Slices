import { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { productionService } from '../services/production.service';
import type { ProductionBatch } from '../types/production.types';

export function ProductionPage() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productionService
      .list()
      .then(setBatches)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle title="Producción" description="Registro de lotes producidos, consumo de ingredientes y salida a inventario terminado." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <DataTable
          data={batches}
          columns={[
            { key: 'date', header: 'Fecha', render: (row) => row.production_date },
            { key: 'batches', header: 'Batches', render: (row) => row.batches_quantity },
            { key: 'units', header: 'Unidades', render: (row) => row.units_produced },
            { key: 'cost', header: 'Costo estimado', render: (row) => <MoneyText value={Number(row.estimated_total_cost)} /> }
          ]}
        />
      ) : null}
    </section>
  );
}
