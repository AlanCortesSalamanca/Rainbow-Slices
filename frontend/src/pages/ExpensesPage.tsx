import { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { expensesService } from '../services/expenses.service';
import type { Expense } from '../types/expense.types';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    expensesService
      .list()
      .then(setExpenses)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle title="Gastos" description="Gastos manuales. Los ingredientes se registran automáticamente desde entradas de inventario." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <DataTable
          data={expenses}
          columns={[
            { key: 'date', header: 'Fecha', render: (row) => row.expense_date },
            { key: 'concept', header: 'Concepto', render: (row) => row.concept },
            { key: 'category', header: 'Categoría', render: (row) => row.category },
            { key: 'source', header: 'Origen', render: (row) => row.source },
            { key: 'amount', header: 'Monto', render: (row) => <MoneyText value={Number(row.amount)} /> }
          ]}
        />
      ) : null}
    </section>
  );
}
