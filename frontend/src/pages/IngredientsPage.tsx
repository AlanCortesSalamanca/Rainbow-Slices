import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageTitle } from '../components/PageTitle';
import { StatusBadge } from '../components/StatusBadge';
import { ingredientsService } from '../services/ingredients.service';
import type { Ingredient } from '../types/ingredient.types';

export function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ingredientsService
      .list()
      .then(setIngredients)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle title="Ingredientes" description="Materia prima y mínimos de inventario." actions={<Link to="/ingredients/new"><Button>Nuevo ingrediente</Button></Link>} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && ingredients.length === 0 ? <EmptyState title="Sin ingredientes" description="Ejecuta los seeds o registra ingredientes manualmente." /> : null}
      {!loading && !error && ingredients.length > 0 ? (
        <DataTable
          data={ingredients}
          columns={[
            { key: 'name', header: 'Ingrediente', render: (row) => row.name },
            { key: 'unit', header: 'Unidad', render: (row) => row.unit },
            { key: 'minimum', header: 'Mínimo', render: (row) => row.minimum_stock },
            { key: 'active', header: 'Estado', render: (row) => <StatusBadge value={row.active ? 'active' : 'inactive'} /> }
          ]}
        />
      ) : null}
    </section>
  );
}
