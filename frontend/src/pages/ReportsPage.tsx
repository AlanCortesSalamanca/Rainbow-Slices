import { useEffect, useState } from 'react';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { reportsService } from '../services/reports.service';
import type { SummaryReport } from '../types/report.types';
import './ReportsPage.css';

export function ReportsPage() {
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsService
      .summary()
      .then(setSummary)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageTitle title="Reportes básicos" description="Filtros por fecha para ingresos, gastos, ganancia estimada, ventas, stock bajo y mermas. Sin dashboard en esta etapa." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {summary ? (
        <div className="reports-grid">
          <article className="panel reports-card"><span>Ingresos</span><strong><MoneyText value={summary.totalIncome} /></strong></article>
          <article className="panel reports-card"><span>Gastos</span><strong><MoneyText value={summary.totalExpenses} /></strong></article>
          <article className="panel reports-card"><span>Ganancia estimada</span><strong><MoneyText value={summary.estimatedProfit} /></strong></article>
        </div>
      ) : null}
    </section>
  );
}
