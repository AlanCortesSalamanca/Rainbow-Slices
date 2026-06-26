import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { StatusBadge } from '../components/StatusBadge';
import { productsService } from '../services/products.service';
import type { ProductDetailResponse } from '../types/product.types';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productsService
      .getById(id)
      .then(setDetail)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!detail) return null;

  return (
    <section>
      <PageTitle title={detail.product.name} description="Detalle operativo del producto." actions={<Link to={`/products/${id}/edit`}><Button>Editar</Button></Link>} />
      <div className="panel form-grid">
        <p><strong>Estado:</strong> <StatusBadge value={detail.product.status} /></p>
        <p><strong>Presentación:</strong> {detail.product.presentation}</p>
        <p><strong>Precio:</strong> <MoneyText value={Number(detail.product.sale_price)} /></p>
        <p><strong>Unidades por producción:</strong> {detail.product.pieces_per_batch}</p>
        <p><strong>Costo batch estimado:</strong> <MoneyText value={Number(detail.recipeCost?.batch_cost ?? 0)} /></p>
        <p><strong>Ganancia estimada:</strong> <MoneyText value={Number(detail.recipeCost?.estimated_profit ?? 0)} /></p>
        <p><strong>Puede preparar:</strong> {detail.availability?.can_prepare_one_batch ? 'Sí' : 'No'}</p>
        <p><strong>Batches disponibles:</strong> {detail.availability?.max_batches_available ?? 0}</p>
      </div>
    </section>
  );
}
